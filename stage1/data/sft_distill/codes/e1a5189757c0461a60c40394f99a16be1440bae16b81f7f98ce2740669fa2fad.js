class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      score: 0,
      itemsCollected: 0,
      totalItems: 8,
      gameState: 'playing'
    };

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建可收集物体纹理（灰色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0x808080, 1);
    itemGraphics.fillCircle(15, 15, 15);
    itemGraphics.generateTexture('collectible', 30, 30);
    itemGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建可收集物体组
    this.collectibles = this.physics.add.group();

    // 生成 8 个可收集物体，随机分布
    const positions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 },
      { x: 400, y: 100 },
      { x: 200, y: 300 },
      { x: 600, y: 300 },
      { x: 400, y: 500 }
    ];

    positions.forEach(pos => {
      const item = this.collectibles.create(pos.x, pos.y, 'collectible');
      item.setCircle(15); // 设置圆形碰撞体
    });

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 添加键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this.collectItem,
      null,
      this
    );

    console.log(JSON.stringify({
      event: 'game_start',
      totalItems: 8,
      score: 0
    }));
  }

  update(time, delta) {
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
    // 物体消失
    item.disableBody(true, true);

    // 增加分数
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);

    // 更新信号
    window.__signals__.score = this.score;
    window.__signals__.itemsCollected += 1;

    // 输出日志
    console.log(JSON.stringify({
      event: 'item_collected',
      score: this.score,
      itemsCollected: window.__signals__.itemsCollected,
      remainingItems: window.__signals__.totalItems - window.__signals__.itemsCollected
    }));

    // 检查是否收集完所有物体
    if (window.__signals__.itemsCollected === window.__signals__.totalItems) {
      window.__signals__.gameState = 'completed';
      
      const winText = this.add.text(400, 300, 'All Items Collected!', {
        fontSize: '48px',
        fill: '#00ff00',
        fontFamily: 'Arial'
      });
      winText.setOrigin(0.5);

      console.log(JSON.stringify({
        event: 'game_complete',
        finalScore: this.score,
        totalItems: window.__signals__.totalItems
      }));
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