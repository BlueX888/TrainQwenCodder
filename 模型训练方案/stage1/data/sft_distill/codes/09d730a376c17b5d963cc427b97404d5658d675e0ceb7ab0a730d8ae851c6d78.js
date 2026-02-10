class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.survivalTime = 0; // 存活时间（秒）
    this.collisionCount = 0; // 碰撞次数
    this.isGameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（青色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ffff, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家精灵（中心位置）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.playerSpeed = 200 * 1.2; // 240

    // 创建敌人精灵（随机边缘位置）
    const startX = Phaser.Math.Between(0, 1) === 0 ? 50 : 750;
    const startY = Phaser.Math.Between(100, 500);
    this.enemy = this.physics.add.sprite(startX, startY, 'enemy');
    this.enemySpeed = 200;

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.handleCollision, null, this);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(16, 560, '使用方向键移动 | 绿色=玩家(速度240) | 青色=敌人(速度200)', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });

    // 启动计时器
    this.startTime = this.time.now;
  }

  update(time, delta) {
    if (this.isGameOver) {
      return;
    }

    // 更新存活时间
    this.survivalTime = ((time - this.startTime) / 1000).toFixed(1);

    // 更新状态显示
    this.statusText.setText(
      `存活时间: ${this.survivalTime}秒 | 碰撞次数: ${this.collisionCount} | 玩家速度: 240 | 敌人速度: 200`
    );

    // 玩家移动控制
    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown) {
      velocityX = -1;
    } else if (this.cursors.right.isDown) {
      velocityX = 1;
    }

    if (this.cursors.up.isDown) {
      velocityY = -1;
    } else if (this.cursors.down.isDown) {
      velocityY = 1;
    }

    // 归一化对角线速度
    if (velocityX !== 0 && velocityY !== 0) {
      const magnitude = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      velocityX = (velocityX / magnitude) * this.playerSpeed;
      velocityY = (velocityY / magnitude) * this.playerSpeed;
    } else {
      velocityX *= this.playerSpeed;
      velocityY *= this.playerSpeed;
    }

    this.player.setVelocity(velocityX, velocityY);

    // 敌人追踪玩家
    this.physics.moveToObject(this.enemy, this.player, this.enemySpeed);
  }

  handleCollision(player, enemy) {
    // 增加碰撞计数
    this.collisionCount++;

    // 将敌人重置到随机边缘位置
    const edge = Phaser.Math.Between(0, 3);
    let newX, newY;

    switch (edge) {
      case 0: // 左边
        newX = 50;
        newY = Phaser.Math.Between(100, 500);
        break;
      case 1: // 右边
        newX = 750;
        newY = Phaser.Math.Between(100, 500);
        break;
      case 2: // 上边
        newX = Phaser.Math.Between(100, 700);
        newY = 50;
        break;
      case 3: // 下边
        newX = Phaser.Math.Between(100, 700);
        newY = 550;
        break;
    }

    enemy.setPosition(newX, newY);

    // 闪烁效果提示碰撞
    player.setTint(0xff0000);
    this.time.delayedCall(200, () => {
      player.clearTint();
    });
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