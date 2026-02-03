class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.survivalTime = 0; // 存活时间（秒）
    this.collisionCount = 0; // 碰撞次数
    this.isGameOver = false; // 游戏结束标志
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

    // 创建玩家精灵（屏幕中心）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人精灵（随机位置，但距离玩家较远）
    const enemyX = Phaser.Math.Between(0, 1) === 0 ? 100 : 700;
    const enemyY = Phaser.Math.Between(100, 500);
    this.enemy = this.physics.add.sprite(enemyX, enemyY, 'enemy');

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.handleCollision, null, this);

    // 显示状态信息
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文字
    this.add.text(400, 550, '使用方向键或WASD移动 | 躲避橙色敌人', {
      fontSize: '16px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 记录游戏开始时间
    this.startTime = this.time.now;
  }

  update(time, delta) {
    if (this.isGameOver) {
      return;
    }

    // 更新存活时间
    this.survivalTime = ((time - this.startTime) / 1000).toFixed(1);

    // 更新状态文本
    this.statusText.setText(
      `存活时间: ${this.survivalTime}秒 | 碰撞次数: ${this.collisionCount} | 玩家速度: 240 | 敌人速度: 200`
    );

    // 玩家移动逻辑（速度 200 * 1.2 = 240）
    const playerSpeed = 240;
    this.player.setVelocity(0);

    // 检测方向键或WASD
    const left = this.cursors.left.isDown || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;
    const up = this.cursors.up.isDown || this.wasd.up.isDown;
    const down = this.cursors.down.isDown || this.wasd.down.isDown;

    let velocityX = 0;
    let velocityY = 0;

    if (left) {
      velocityX = -playerSpeed;
    } else if (right) {
      velocityX = playerSpeed;
    }

    if (up) {
      velocityY = -playerSpeed;
    } else if (down) {
      velocityY = playerSpeed;
    }

    // 处理斜向移动时的速度归一化
    if (velocityX !== 0 && velocityY !== 0) {
      const normalizedSpeed = playerSpeed / Math.sqrt(2);
      velocityX = velocityX > 0 ? normalizedSpeed : -normalizedSpeed;
      velocityY = velocityY > 0 ? normalizedSpeed : -normalizedSpeed;
    }

    this.player.setVelocity(velocityX, velocityY);

    // 敌人追踪玩家（速度 200）
    const enemySpeed = 200;
    this.physics.moveToObject(this.enemy, this.player, enemySpeed);
  }

  handleCollision(player, enemy) {
    // 碰撞计数
    this.collisionCount++;

    // 碰撞后将敌人重置到远处
    const newX = Phaser.Math.Between(0, 1) === 0 ? 50 : 750;
    const newY = Phaser.Math.Between(50, 550);
    enemy.setPosition(newX, newY);

    // 闪烁效果
    this.cameras.main.flash(200, 255, 100, 0);
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