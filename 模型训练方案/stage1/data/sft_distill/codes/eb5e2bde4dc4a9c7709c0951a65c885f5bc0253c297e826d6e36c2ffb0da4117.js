class CollectionGame extends Phaser.Scene {
  constructor() {
    super('CollectionGame');
    this.collectedCount = 0;
    this.totalItems = 15;
    this.gameCompleted = false;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建椭圆纹理
    const ellipseGraphics = this.add.graphics();
    ellipseGraphics.fillStyle(0xffff00, 1);
    ellipseGraphics.fillEllipse(15, 10, 30, 20);
    ellipseGraphics.generateTexture('ellipse', 30, 20);
    ellipseGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建椭圆收集物组
    this.collectibles = this.physics.add.group();

    // 随机生成15个椭圆
    for (let i = 0; i < this.totalItems; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const ellipse = this.collectibles.create(x, y, 'ellipse');
      ellipse.setCircle(10); // 设置碰撞体积
    }

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this.collectItem,
      null,
      this
    );

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建计数文本
    this.scoreText = this.add.text(16, 16, `已收集: 0/${this.totalItems}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 创建通关文本（初始隐藏）
    this.winText = this.add.text(400, 300, '恭喜通关！', {
      fontSize: '48px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.winText.setOrigin(0.5);
    this.winText.setVisible(false);
  }

  collectItem(player, item) {
    // 移除收集到的椭圆
    item.destroy();
    
    // 增加计数
    this.collectedCount++;
    
    // 更新文本
    this.scoreText.setText(`已收集: ${this.collectedCount}/${this.totalItems}`);
    
    // 检查是否收集完成
    if (this.collectedCount >= this.totalItems && !this.gameCompleted) {
      this.gameCompleted = true;
      this.winText.setVisible(true);
      
      // 停止玩家移动
      this.player.setVelocity(0, 0);
    }
  }

  update(time, delta) {
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

const game = new Phaser.Game(config);