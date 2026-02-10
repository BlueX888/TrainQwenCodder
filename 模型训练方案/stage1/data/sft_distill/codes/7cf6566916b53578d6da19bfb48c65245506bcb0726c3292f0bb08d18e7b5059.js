class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerSpeed = 300 * 1.2; // 360
    this.enemySpeed = 300;
    this.distanceToEnemy = 0;
    this.survived = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（橙色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff8800, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人
    this.enemy = this.physics.add.sprite(100, 100, 'enemy');

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemy,
      this.handleCollision,
      null,
      this
    );

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加文本显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 初始化信号
    window.__signals__ = {
      playerX: this.player.x,
      playerY: this.player.y,
      enemyX: this.enemy.x,
      enemyY: this.enemy.y,
      distanceToEnemy: 0,
      survived: 0,
      caught: false,
      playerSpeed: this.playerSpeed,
      enemySpeed: this.enemySpeed
    };

    console.log(JSON.stringify({
      type: 'game_start',
      playerSpeed: this.playerSpeed,
      enemySpeed: this.enemySpeed
    }));
  }

  update(time, delta) {
    if (window.__signals__.caught) {
      return;
    }

    // 玩家移动控制
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
    }

    // 对角线移动速度归一化
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      const normalized = new Phaser.Math.Vector2(
        this.player.body.velocity.x,
        this.player.body.velocity.y
      ).normalize();
      this.player.setVelocity(
        normalized.x * this.playerSpeed,
        normalized.y * this.playerSpeed
      );
    }

    // 敌人追踪玩家
    this.physics.moveToObject(this.enemy, this.player, this.enemySpeed);

    // 计算距离
    this.distanceToEnemy = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.enemy.x,
      this.enemy.y
    );

    // 更新存活时间
    this.survived += delta;

    // 更新信号
    window.__signals__.playerX = Math.round(this.player.x);
    window.__signals__.playerY = Math.round(this.player.y);
    window.__signals__.enemyX = Math.round(this.enemy.x);
    window.__signals__.enemyY = Math.round(this.enemy.y);
    window.__signals__.distanceToEnemy = Math.round(this.distanceToEnemy);
    window.__signals__.survived = Math.round(this.survived);

    // 更新显示文本
    this.statusText.setText([
      `Player Speed: ${this.playerSpeed}`,
      `Enemy Speed: ${this.enemySpeed}`,
      `Distance: ${Math.round(this.distanceToEnemy)}`,
      `Survived: ${(this.survived / 1000).toFixed(1)}s`,
      `Use Arrow Keys to Move`
    ]);

    // 每秒记录一次日志
    if (Math.floor(this.survived / 1000) > Math.floor((this.survived - delta) / 1000)) {
      console.log(JSON.stringify({
        type: 'status_update',
        survived: Math.round(this.survived / 1000),
        distance: Math.round(this.distanceToEnemy),
        playerPos: { x: Math.round(this.player.x), y: Math.round(this.player.y) },
        enemyPos: { x: Math.round(this.enemy.x), y: Math.round(this.enemy.y) }
      }));
    }
  }

  handleCollision(player, enemy) {
    // 玩家被抓住
    window.__signals__.caught = true;
    
    this.player.setTint(0xff0000);
    this.physics.pause();

    this.statusText.setText([
      `CAUGHT!`,
      `Survived: ${(this.survived / 1000).toFixed(1)}s`,
      `Final Distance: ${Math.round(this.distanceToEnemy)}`,
      `Player Speed: ${this.playerSpeed}`,
      `Enemy Speed: ${this.enemySpeed}`
    ]);

    console.log(JSON.stringify({
      type: 'game_over',
      caught: true,
      survived: Math.round(this.survived),
      finalDistance: Math.round(this.distanceToEnemy)
    }));
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);