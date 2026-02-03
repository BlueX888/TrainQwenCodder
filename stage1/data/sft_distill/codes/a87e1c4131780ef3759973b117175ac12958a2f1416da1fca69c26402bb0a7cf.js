class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.totalItems = 15;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物纹理
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillRect(0, 0, 20, 20);
    itemGraphics.generateTexture('item', 20, 20);
    itemGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建收集物组
    this.items = this.physics.add.group();

    // 随机生成15个收集物
    for (let i = 0; i < this.totalItems; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const item = this.items.create(x, y, 'item');
      item.setImmovable(true);
    }

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, '收集: 0/' + this.totalItems, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 创建通关文本（初始隐藏）
    this.winText = this.add.text(400, 300, '恭喜通关！', {
      fontSize: '48px',
      fill: '#00ff00',
      fontStyle: 'bold'
    });
    this.winText.setOrigin(0.5);
    this.winText.setVisible(false);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
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

  collectItem(player, item) {
    // 移除收集物
    item.destroy();

    // 增加分数
    this.score++;

    // 更新分数文本
    this.scoreText.setText('收集: ' + this.score + '/' + this.totalItems);

    // 检查是否收集完成
    if (this.score >= this.totalItems) {
      this.winText.setVisible(true);
      this.player.setVelocity(0, 0);
      
      // 禁用玩家控制
      this.physics.pause();
      
      console.log('Game completed! Score:', this.score);
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

const game = new Phaser.Game(config);