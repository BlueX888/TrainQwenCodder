class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerSpeed = 120 * 1.2; // 144
    this.enemySpeed = 120;
    this.collisionCount = 0;
    this.minDistance = Infinity;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化 signals
    window.__signals__ = {
      collisionCount: 0,
      minDistance: Infinity,
      playerSpeed: this.playerSpeed,
      enemySpeed: this.enemySpeed,
      gameTime: 0,
      escaped: false
    };

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家精灵（中心位置）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人精灵（随机边缘位置）
    const startX = Phaser.Math.Between(0, 1) === 0 ? 50 : 750;
    const startY = Phaser.Math.Between(100, 500);
    this.enemy = this.physics.add.sprite(startX, startY, 'enemy');

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemy,
      this.handleCollision,
      null,
      this
    );

    // 添加文本显示
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加提示文本
    this.add.text(400, 50, '使用方向键移动（蓝色玩家）\n躲避红色敌人追踪', {
      fontSize: '20px',
      fill: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    console.log('[Game Started]', JSON.stringify({
      playerSpeed: this.playerSpeed,
      enemySpeed: this.enemySpeed,
      playerPos: { x: this.player.x, y: this.player.y },
      enemyPos: { x: this.enemy.x, y: this.enemy.y }
    }));
  }

  update(time, delta) {
    // 更新游戏时间
    window.__signals__.gameTime = time;

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

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(this.playerSpeed);
    }

    // 敌人追踪玩家
    this.physics.moveToObject(this.enemy, this.player, this.enemySpeed);

    // 计算距离
    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.enemy.x,
      this.enemy.y
    );

    // 更新最小距离
    if (distance < this.minDistance) {
      this.minDistance = distance;
      window.__signals__.minDistance = Math.floor(this.minDistance);
    }

    // 检查是否成功逃脱（保持距离超过5秒）
    if (distance > 300 && time > 5000) {
      window.__signals__.escaped = true;
    }

    // 更新信息显示
    this.infoText.setText([
      `玩家速度: ${this.playerSpeed}`,
      `敌人速度: ${this.enemySpeed}`,
      `当前距离: ${Math.floor(distance)}`,
      `最小距离: ${Math.floor(this.minDistance)}`,
      `碰撞次数: ${this.collisionCount}`,
      `游戏时间: ${Math.floor(time / 1000)}s`
    ]);
  }

  handleCollision() {
    this.collisionCount++;
    window.__signals__.collisionCount = this.collisionCount;

    // 碰撞时重置敌人位置
    const edge = Phaser.Math.Between(0, 3);
    switch (edge) {
      case 0: // 上
        this.enemy.setPosition(Phaser.Math.Between(50, 750), 50);
        break;
      case 1: // 右
        this.enemy.setPosition(750, Phaser.Math.Between(50, 550));
        break;
      case 2: // 下
        this.enemy.setPosition(Phaser.Math.Between(50, 750), 550);
        break;
      case 3: // 左
        this.enemy.setPosition(50, Phaser.Math.Between(50, 550));
        break;
    }

    console.log('[Collision]', JSON.stringify({
      count: this.collisionCount,
      minDistance: Math.floor(this.minDistance),
      time: Math.floor(this.time.now / 1000)
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