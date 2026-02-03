class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.survivedTime = 0;
    this.collisionCount = 0;
    this.distance = 0;
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

    // 创建敌人纹理（黄色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xffff00, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家精灵（中心位置）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人精灵（随机位置）
    const startX = Phaser.Math.Between(100, 700);
    const startY = Phaser.Math.Between(100, 500);
    this.enemy = this.physics.add.sprite(startX, startY, 'enemy');

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.handleCollision, null, this);

    // 创建状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建游戏说明
    this.add.text(10, 560, '使用方向键移动 | 玩家速度: 240 | 敌人速度: 200', {
      fontSize: '14px',
      fill: '#00ff00'
    });

    // 初始化计时器
    this.startTime = this.time.now;
  }

  update(time, delta) {
    // 更新存活时间
    this.survivedTime = Math.floor((time - this.startTime) / 1000);

    // 玩家移动控制（速度 240）
    const playerSpeed = 240;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(playerSpeed);
    }

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(playerSpeed);
    }

    // 敌人追踪玩家（速度 200）
    const enemySpeed = 200;
    this.physics.moveToObject(this.enemy, this.player, enemySpeed);

    // 计算玩家与敌人的距离
    this.distance = Math.floor(
      Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        this.enemy.x, this.enemy.y
      )
    );

    // 更新状态文本
    this.statusText.setText([
      `存活时间: ${this.survivedTime}秒`,
      `碰撞次数: ${this.collisionCount}`,
      `距离敌人: ${this.distance}px`,
      `玩家位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
      `敌人位置: (${Math.floor(this.enemy.x)}, ${Math.floor(this.enemy.y)})`
    ]);
  }

  handleCollision(player, enemy) {
    // 增加碰撞计数
    this.collisionCount++;

    // 敌人被击退到随机位置
    const newX = Phaser.Math.Between(100, 700);
    const newY = Phaser.Math.Between(100, 500);
    enemy.setPosition(newX, newY);

    // 视觉反馈：玩家闪烁
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 2
    });

    // 如果碰撞次数过多，可以选择结束游戏
    if (this.collisionCount >= 10) {
      this.scene.pause();
      this.add.text(400, 300, '游戏结束！\n碰撞次数过多', {
        fontSize: '32px',
        fill: '#ff0000',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5);
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