class CollectGameScene extends Phaser.Scene {
  constructor() {
    super('CollectGameScene');
    this.score = 0;
    this.collectedCount = 0;
  }

  preload() {
    // 使用 Graphics 生成纹理，无需外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      score: 0,
      collectedCount: 0,
      totalItems: 15,
      gameComplete: false
    };

    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建收集物纹理（紫色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0x9933ff, 1);
    itemGraphics.fillCircle(15, 15, 15);
    itemGraphics.generateTexture('collectItem', 30, 30);
    itemGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建收集物组
    this.collectItems = this.physics.add.group();

    // 随机生成15个收集物
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const item = this.collectItems.create(x, y, 'collectItem');
      item.setCircle(15); // 设置圆形碰撞体
    }

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });

    // 创建提示文本
    this.hintText = this.add.text(400, 16, 'Use Arrow Keys to Move and Collect Items!', {
      fontSize: '20px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });
    this.hintText.setOrigin(0.5, 0);

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.collectItems,
      this.collectItem,
      null,
      this
    );

    // 日志输出初始状态
    console.log(JSON.stringify({
      event: 'game_start',
      totalItems: 15,
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
    // 销毁收集物
    item.destroy();

    // 增加分数
    this.score += 10;
    this.collectedCount += 1;

    // 更新分数显示
    this.scoreText.setText('Score: ' + this.score);

    // 更新信号对象
    window.__signals__.score = this.score;
    window.__signals__.collectedCount = this.collectedCount;

    // 日志输出收集事件
    console.log(JSON.stringify({
      event: 'item_collected',
      score: this.score,
      collectedCount: this.collectedCount,
      remainingItems: 15 - this.collectedCount
    }));

    // 检查是否收集完所有物品
    if (this.collectedCount >= 15) {
      window.__signals__.gameComplete = true;
      
      // 显示完成提示
      const completeText = this.add.text(400, 300, 'All Items Collected!\nFinal Score: ' + this.score, {
        fontSize: '48px',
        fill: '#00ff00',
        fontFamily: 'Arial',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 6
      });
      completeText.setOrigin(0.5);

      // 停止玩家移动
      this.player.setVelocity(0, 0);
      this.cursors = null;

      // 日志输出完成事件
      console.log(JSON.stringify({
        event: 'game_complete',
        finalScore: this.score,
        totalCollected: this.collectedCount
      }));
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
  scene: CollectGameScene
};

// 启动游戏
const game = new Phaser.Game(config);