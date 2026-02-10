class CollectStarsScene extends Phaser.Scene {
  constructor() {
    super('CollectStarsScene');
    this.collectedStars = 0; // 可验证的状态信号
    this.totalStars = 5;
    this.gameCompleted = false;
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建星形纹理（黄色星星）
    const starGraphics = this.add.graphics();
    starGraphics.fillStyle(0xffff00, 1);
    
    // 绘制五角星
    const centerX = 16;
    const centerY = 16;
    const outerRadius = 15;
    const innerRadius = 6;
    const points = [];
    
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      points.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      });
    }
    
    starGraphics.beginPath();
    starGraphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      starGraphics.lineTo(points[i].x, points[i].y);
    }
    starGraphics.closePath();
    starGraphics.fillPath();
    starGraphics.generateTexture('star', 32, 32);
    starGraphics.destroy();
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建星形组
    this.stars = this.physics.add.group();

    // 随机生成5个星形
    for (let i = 0; i < this.totalStars; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const star = this.stars.create(x, y, 'star');
      star.setCollideWorldBounds(true);
      
      // 添加轻微的浮动效果
      this.tweens.add({
        targets: star,
        y: star.y + 10,
        duration: 1000 + i * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.stars,
      this.collectStar,
      null,
      this
    );

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建计数文本
    this.scoreText = this.add.text(16, 16, `星星: ${this.collectedStars}/${this.totalStars}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 创建提示文本
    this.add.text(400, 560, '使用方向键移动收集星星', {
      fontSize: '18px',
      fill: '#aaaaaa',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建通关文本（初始隐藏）
    this.winText = this.add.text(400, 300, '恭喜通关！', {
      fontSize: '64px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setVisible(false);
  }

  update() {
    if (this.gameCompleted) {
      return; // 游戏完成后停止更新
    }

    // 玩家移动控制
    const speed = 200;

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

  collectStar(player, star) {
    // 销毁星形
    star.destroy();

    // 更新计数
    this.collectedStars++;
    this.scoreText.setText(`星星: ${this.collectedStars}/${this.totalStars}`);

    // 添加收集音效替代（使用闪烁效果）
    this.cameras.main.flash(100, 255, 255, 0);

    // 检查是否收集完所有星星
    if (this.collectedStars >= this.totalStars) {
      this.completeGame();
    }
  }

  completeGame() {
    this.gameCompleted = true;

    // 停止玩家移动
    this.player.setVelocity(0, 0);

    // 显示通关文本
    this.winText.setVisible(true);

    // 添加文本缩放动画
    this.tweens.add({
      targets: this.winText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 添加背景闪烁效果
    this.tweens.add({
      targets: this.cameras.main,
      alpha: 0.8,
      duration: 300,
      yoyo: true,
      repeat: 5
    });
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: CollectStarsScene
};

// 启动游戏
const game = new Phaser.Game(config);