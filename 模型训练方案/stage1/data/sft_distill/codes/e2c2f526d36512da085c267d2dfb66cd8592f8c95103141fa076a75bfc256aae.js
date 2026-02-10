class CollectionGame extends Phaser.Scene {
  constructor() {
    super('CollectionGame');
    this.collectedCount = 0; // 可验证的状态信号
    this.totalDiamonds = 5;
  }

  preload() {
    // 创建玩家纹理（蓝色圆形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillCircle(20, 20, 20);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建菱形纹理（黄色菱形）
    const diamondGraphics = this.add.graphics();
    diamondGraphics.fillStyle(0xffff00, 1);
    diamondGraphics.beginPath();
    diamondGraphics.moveTo(15, 0);
    diamondGraphics.lineTo(30, 15);
    diamondGraphics.lineTo(15, 30);
    diamondGraphics.lineTo(0, 15);
    diamondGraphics.closePath();
    diamondGraphics.fillPath();
    diamondGraphics.generateTexture('diamond', 30, 30);
    diamondGraphics.destroy();
  }

  create() {
    // 添加背景色
    this.cameras.main.setBackgroundColor('#2d2d2d');

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.8);

    // 创建菱形收集物组
    this.diamonds = this.physics.add.group();

    // 随机生成5个菱形
    for (let i = 0; i < this.totalDiamonds; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const diamond = this.diamonds.create(x, y, 'diamond');
      diamond.setCollideWorldBounds(true);
      
      // 添加轻微的浮动效果
      this.tweens.add({
        targets: diamond,
        y: diamond.y + 10,
        duration: 1000 + i * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.diamonds,
      this.collectDiamond,
      null,
      this
    );

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建计数文本
    this.countText = this.add.text(16, 16, `收集: ${this.collectedCount}/${this.totalDiamonds}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 创建提示文本
    this.add.text(400, 580, '使用方向键移动收集菱形', {
      fontSize: '18px',
      fill: '#aaaaaa',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 通关文本（初始隐藏）
    this.victoryText = this.add.text(400, 300, '恭喜通关！', {
      fontSize: '64px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setVisible(false);
  }

  update() {
    // 玩家移动控制
    const speed = 300;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }
  }

  collectDiamond(player, diamond) {
    // 收集菱形
    diamond.destroy();
    this.collectedCount++;

    // 更新计数文本
    this.countText.setText(`收集: ${this.collectedCount}/${this.totalDiamonds}`);

    // 添加收集音效（视觉反馈）
    this.tweens.add({
      targets: this.countText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });

    // 检查是否收集完成
    if (this.collectedCount >= this.totalDiamonds) {
      this.showVictory();
    }
  }

  showVictory() {
    // 显示通关文本
    this.victoryText.setVisible(true);

    // 停止玩家移动
    this.player.setVelocity(0, 0);

    // 添加闪烁动画
    this.tweens.add({
      targets: this.victoryText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 添加旋转动画到玩家
    this.tweens.add({
      targets: this.player,
      angle: 360,
      duration: 2000,
      repeat: -1,
      ease: 'Linear'
    });

    // 禁用键盘输入
    this.cursors.left.enabled = false;
    this.cursors.right.enabled = false;
    this.cursors.up.enabled = false;
    this.cursors.down.enabled = false;
  }
}

// 游戏配置
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
  scene: CollectionGame
};

// 创建游戏实例
const game = new Phaser.Game(config);