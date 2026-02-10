class CollectionGame extends Phaser.Scene {
  constructor() {
    super('CollectionGame');
    this.collectedCount = 0;
    this.totalItems = 15;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色圆形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
    playerGraphics.fillCircle(20, 20, 20);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建椭圆纹理（黄色椭圆）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillEllipse(15, 10, 30, 20);
    itemGraphics.lineStyle(2, 0xff9900, 1);
    itemGraphics.strokeEllipse(15, 10, 30, 20);
    itemGraphics.generateTexture('item', 30, 20);
    itemGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setCircle(20);

    // 创建椭圆收集物组
    this.items = this.physics.add.group();
    
    // 随机分布15个椭圆
    for (let i = 0; i < this.totalItems; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const item = this.items.create(x, y, 'item');
      item.setScale(1.5);
      item.body.setSize(30, 20);
    }

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.items,
      this.collectItem,
      null,
      this
    );

    // 创建计数文本
    this.scoreText = this.add.text(16, 16, `收集: 0/${this.totalItems}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.scoreText.setDepth(1);

    // 创建控制提示
    this.add.text(16, 560, '使用方向键移动', {
      fontSize: '18px',
      fill: '#cccccc'
    });

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 通关文本（初始隐藏）
    this.winText = this.add.text(400, 300, '恭喜通关！', {
      fontSize: '64px',
      fill: '#00ff00',
      stroke: '#000000',
      strokeThickness: 6,
      fontStyle: 'bold'
    });
    this.winText.setOrigin(0.5);
    this.winText.setVisible(false);
    this.winText.setDepth(2);
  }

  update() {
    // 玩家移动控制
    const speed = 200;
    
    this.player.setVelocity(0);

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

    // 归一化对角线速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(speed);
    }
  }

  collectItem(player, item) {
    // 移除收集到的椭圆
    item.destroy();
    
    // 增加计数
    this.collectedCount++;
    
    // 更新文本
    this.scoreText.setText(`收集: ${this.collectedCount}/${this.totalItems}`);
    
    // 检查是否通关
    if (this.collectedCount >= this.totalItems) {
      this.winGame();
    }
  }

  winGame() {
    // 停止玩家移动
    this.player.setVelocity(0);
    this.physics.pause();
    
    // 显示通关文本
    this.winText.setVisible(true);
    
    // 添加闪烁效果
    this.tweens.add({
      targets: this.winText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1
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
  scene: CollectionGame
};

new Phaser.Game(config);