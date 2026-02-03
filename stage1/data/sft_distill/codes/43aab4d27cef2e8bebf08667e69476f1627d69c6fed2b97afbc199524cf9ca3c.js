class CollectionGame extends Phaser.Scene {
  constructor() {
    super('CollectionGame');
    this.collectedCount = 0;
    this.totalItems = 15;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（蓝色圆形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillCircle(20, 20, 20);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建收集物纹理（黄色椭圆）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffdd00, 1);
    itemGraphics.fillEllipse(15, 10, 30, 20);
    itemGraphics.generateTexture('item', 30, 20);
    itemGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.95);

    // 创建收集物物理组
    this.items = this.physics.add.group();

    // 随机生成15个椭圆收集物
    for (let i = 0; i < this.totalItems; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const item = this.items.create(x, y, 'item');
      item.setCircle(10); // 设置碰撞体积
      
      // 添加轻微的浮动效果
      this.tweens.add({
        targets: item,
        y: item.y + 10,
        duration: 1000 + Math.random() * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.items,
      this.collectItem,
      null,
      this
    );

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.scoreText = this.add.text(16, 16, `收集进度: 0/${this.totalItems}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });

    // 创建通关文本（初始隐藏）
    this.winText = this.add.text(400, 300, '恭喜通关！', {
      fontSize: '64px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#ff0000',
      strokeThickness: 6
    });
    this.winText.setOrigin(0.5);
    this.winText.setVisible(false);

    // 添加提示文本
    this.add.text(400, 580, '使用方向键移动收集所有椭圆', {
      fontSize: '18px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    // 玩家移动控制
    const speed = 300;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }
  }

  collectItem(player, item) {
    // 销毁收集物
    item.destroy();

    // 增加收集计数
    this.collectedCount++;

    // 更新UI
    this.scoreText.setText(`收集进度: ${this.collectedCount}/${this.totalItems}`);

    // 添加收集音效（视觉反馈）
    const flash = this.add.circle(item.x, item.y, 30, 0xffffff, 0.8);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => flash.destroy()
    });

    // 检查是否通关
    if (this.collectedCount >= this.totalItems) {
      this.gameWin();
    }
  }

  gameWin() {
    // 显示通关文本
    this.winText.setVisible(true);

    // 添加通关动画
    this.tweens.add({
      targets: this.winText,
      scale: { from: 0, to: 1.2 },
      duration: 500,
      ease: 'Back.easeOut',
      yoyo: true,
      repeat: -1,
      repeatDelay: 500
    });

    // 停止玩家移动
    this.player.setVelocity(0, 0);
    this.cursors = null;

    // 添加彩色粒子效果
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      const color = Phaser.Display.Color.RandomRGB();
      const particle = this.add.circle(x, y, 5, color.color);
      
      this.tweens.add({
        targets: particle,
        y: y - 200,
        alpha: 0,
        duration: 2000,
        delay: i * 100,
        ease: 'Cubic.easeOut'
      });
    }
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