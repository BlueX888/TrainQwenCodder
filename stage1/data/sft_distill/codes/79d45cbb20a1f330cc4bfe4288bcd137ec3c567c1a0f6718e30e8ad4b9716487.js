class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.survivalTime = 0; // 存活时间（秒）
    this.minDistance = Infinity; // 最小距离
    this.isCaught = false; // 是否被抓住
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（黄色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xffff00, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建玩家（中心位置）
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true);
    this.playerSpeed = 300 * 1.2; // 360

    // 创建敌人（随机边缘位置）
    const enemyX = Phaser.Math.Between(0, 1) === 0 ? 50 : width - 50;
    const enemyY = Phaser.Math.Between(50, height - 50);
    this.enemy = this.physics.add.sprite(enemyX, enemyY, 'enemy');
    this.enemySpeed = 300;

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.onCatch, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 显示状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示说明
    this.add.text(width / 2, 30, '使用方向键或WASD躲避黄色敌人！', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // 初始化计时器
    this.startTime = this.time.now;
  }

  update(time, delta) {
    if (this.isCaught) {
      return;
    }

    // 更新存活时间
    this.survivalTime = ((time - this.startTime) / 1000).toFixed(1);

    // 玩家移动控制
    this.player.setVelocity(0);

    const isLeft = this.cursors.left.isDown || this.wasd.left.isDown;
    const isRight = this.cursors.right.isDown || this.wasd.right.isDown;
    const isUp = this.cursors.up.isDown || this.wasd.up.isDown;
    const isDown = this.cursors.down.isDown || this.wasd.down.isDown;

    let velocityX = 0;
    let velocityY = 0;

    if (isLeft) {
      velocityX = -this.playerSpeed;
    } else if (isRight) {
      velocityX = this.playerSpeed;
    }

    if (isUp) {
      velocityY = -this.playerSpeed;
    } else if (isDown) {
      velocityY = this.playerSpeed;
    }

    // 对角线移动时归一化速度
    if (velocityX !== 0 && velocityY !== 0) {
      const factor = Math.sqrt(2) / 2;
      velocityX *= factor;
      velocityY *= factor;
    }

    this.player.setVelocity(velocityX, velocityY);

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
    }

    // 更新状态显示
    this.statusText.setText([
      `存活时间: ${this.survivalTime}s`,
      `当前距离: ${distance.toFixed(0)}px`,
      `最小距离: ${this.minDistance.toFixed(0)}px`,
      `玩家速度: ${this.playerSpeed}`,
      `敌人速度: ${this.enemySpeed}`,
      `状态: 逃跑中`
    ]);
  }

  onCatch() {
    if (this.isCaught) {
      return;
    }

    this.isCaught = true;

    // 停止所有移动
    this.player.setVelocity(0);
    this.enemy.setVelocity(0);

    // 更新状态
    this.statusText.setText([
      `存活时间: ${this.survivalTime}s`,
      `最小距离: ${this.minDistance.toFixed(0)}px`,
      `状态: 被抓住！`,
      '',
      '刷新页面重新开始'
    ]);

    // 显示游戏结束文本
    const { width, height } = this.cameras.main;
    this.add.text(width / 2, height / 2, '游戏结束！\n被敌人抓住了', {
      fontSize: '32px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 },
      align: 'center'
    }).setOrigin(0.5);

    console.log('Game Over - Survival Time:', this.survivalTime, 'Min Distance:', this.minDistance.toFixed(0));
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