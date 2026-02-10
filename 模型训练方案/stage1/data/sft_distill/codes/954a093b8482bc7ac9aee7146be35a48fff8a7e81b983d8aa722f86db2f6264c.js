class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerSpeed = 300 * 1.2; // 360
    this.enemySpeed = 300;
    this.distanceToPlayer = 0;
    this.gameTime = 0;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（蓝色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x0000ff, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家（中心位置）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人（左上角）
    this.enemy = this.physics.add.sprite(100, 100, 'enemy');

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.onCollision, null, this);

    // 添加文本显示
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 初始化信号对象
    window.__signals__ = {
      playerPosition: { x: 400, y: 300 },
      enemyPosition: { x: 100, y: 100 },
      distanceToPlayer: 0,
      playerSpeed: this.playerSpeed,
      enemySpeed: this.enemySpeed,
      collisionCount: 0,
      gameTime: 0,
      isPlayerMoving: false
    };

    console.log(JSON.stringify({
      event: 'game_start',
      playerSpeed: this.playerSpeed,
      enemySpeed: this.enemySpeed
    }));
  }

  update(time, delta) {
    this.gameTime += delta;

    // 重置玩家速度
    this.player.setVelocity(0);

    let isMoving = false;

    // 玩家移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
      isMoving = true;
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
      isMoving = true;
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
      isMoving = true;
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
      isMoving = true;
    }

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(this.playerSpeed);
    }

    // 敌人追踪玩家
    this.physics.moveToObject(this.enemy, this.player, this.enemySpeed);

    // 计算距离
    this.distanceToPlayer = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.enemy.x,
      this.enemy.y
    );

    // 更新信息显示
    this.infoText.setText([
      `Player Speed: ${this.playerSpeed.toFixed(0)}`,
      `Enemy Speed: ${this.enemySpeed}`,
      `Distance: ${this.distanceToPlayer.toFixed(1)}`,
      `Time: ${(this.gameTime / 1000).toFixed(1)}s`,
      `Use Arrow Keys to Move`
    ]);

    // 更新信号
    window.__signals__.playerPosition = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };
    window.__signals__.enemyPosition = {
      x: Math.round(this.enemy.x),
      y: Math.round(this.enemy.y)
    };
    window.__signals__.distanceToPlayer = Math.round(this.distanceToPlayer);
    window.__signals__.gameTime = Math.round(this.gameTime);
    window.__signals__.isPlayerMoving = isMoving;

    // 每秒输出一次状态日志
    if (Math.floor(this.gameTime / 1000) > Math.floor((this.gameTime - delta) / 1000)) {
      console.log(JSON.stringify({
        event: 'status_update',
        time: Math.floor(this.gameTime / 1000),
        distance: Math.round(this.distanceToPlayer),
        playerPos: window.__signals__.playerPosition,
        enemyPos: window.__signals__.enemyPosition
      }));
    }
  }

  onCollision(player, enemy) {
    window.__signals__.collisionCount++;

    console.log(JSON.stringify({
      event: 'collision',
      count: window.__signals__.collisionCount,
      time: Math.round(this.gameTime / 1000),
      position: {
        x: Math.round(player.x),
        y: Math.round(player.y)
      }
    }));

    // 碰撞后将敌人重置到随机位置
    const edge = Phaser.Math.Between(0, 3);
    switch (edge) {
      case 0: // 上边
        enemy.setPosition(Phaser.Math.Between(0, 800), 0);
        break;
      case 1: // 右边
        enemy.setPosition(800, Phaser.Math.Between(0, 600));
        break;
      case 2: // 下边
        enemy.setPosition(Phaser.Math.Between(0, 800), 600);
        break;
      case 3: // 左边
        enemy.setPosition(0, Phaser.Math.Between(0, 600));
        break;
    }
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