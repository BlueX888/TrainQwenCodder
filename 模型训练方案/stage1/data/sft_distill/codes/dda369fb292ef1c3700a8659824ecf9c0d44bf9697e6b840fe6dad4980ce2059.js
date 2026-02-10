// 完整的 Phaser3 收集物品游戏
class CollectGame extends Phaser.Scene {
  constructor() {
    super('CollectGame');
    this.score = 0;
    this.collectedCount = 0;
  }

  preload() {
    // 不需要加载外部资源
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

    // 创建可收集物品纹理（紫色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0x9b59b6, 1);
    itemGraphics.fillCircle(15, 15, 15);
    itemGraphics.generateTexture('collectible', 30, 30);
    itemGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setScale(1);

    // 创建可收集物品组
    this.collectibles = this.physics.add.group();

    // 生成15个可收集物品，随机分布
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const item = this.collectibles.create(x, y, 'collectible');
      item.setCircle(15); // 设置圆形碰撞体
      item.body.setAllowGravity(false);
      
      // 添加轻微的浮动动画效果
      this.tweens.add({
        targets: item,
        y: y + 10,
        duration: 1000 + Math.random() * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this.collectItem,
      null,
      this
    );

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });

    // 创建提示文本
    this.instructionText = this.add.text(400, 550, 'Use Arrow Keys to Move', {
      fontSize: '20px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    });
    this.instructionText.setOrigin(0.5);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 日志输出初始状态
    console.log(JSON.stringify({
      event: 'game_start',
      totalItems: 15,
      score: 0
    }));
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

    // 更新信号
    window.__signals__.score = this.score;
    window.__signals__.collectedCount = this.collectedCount;
  }

  collectItem(player, item) {
    // 物品消失
    item.destroy();

    // 增加分数
    this.score += 10;
    this.collectedCount += 1;

    // 更新分数显示
    this.scoreText.setText('Score: ' + this.score);

    // 更新信号
    window.__signals__.score = this.score;
    window.__signals__.collectedCount = this.collectedCount;

    // 日志输出收集事件
    console.log(JSON.stringify({
      event: 'item_collected',
      score: this.score,
      collectedCount: this.collectedCount,
      remainingItems: 15 - this.collectedCount
    }));

    // 创建收集特效（闪烁的圆圈）
    const collectEffect = this.add.graphics();
    collectEffect.lineStyle(3, 0xffff00, 1);
    collectEffect.strokeCircle(item.x, item.y, 20);
    
    this.tweens.add({
      targets: collectEffect,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 300,
      onComplete: () => {
        collectEffect.destroy();
      }
    });

    // 检查是否收集完所有物品
    if (this.collectedCount >= 15) {
      this.gameComplete();
    }
  }

  gameComplete() {
    window.__signals__.gameComplete = true;

    // 显示完成文本
    const completeText = this.add.text(400, 300, 'All Items Collected!\nFinal Score: ' + this.score, {
      fontSize: '48px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center'
    });
    completeText.setOrigin(0.5);

    // 停止玩家移动
    this.player.setVelocity(0, 0);

    // 日志输出完成事件
    console.log(JSON.stringify({
      event: 'game_complete',
      finalScore: this.score,
      totalCollected: this.collectedCount
    }));

    // 添加闪烁效果
    this.tweens.add({
      targets: completeText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
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
  scene: CollectGame
};

// 启动游戏
new Phaser.Game(config);