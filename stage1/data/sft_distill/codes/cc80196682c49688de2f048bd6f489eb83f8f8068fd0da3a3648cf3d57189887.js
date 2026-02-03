class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.level = 1;
    this.score = 0;
    this.maxLevel = 12;
    this.collectibles = null;
    this.player = null;
    this.cursors = null;
    this.levelText = null;
    this.scoreText = null;
    this.messageText = null;
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物纹理（黄色圆圈）
    const collectibleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    collectibleGraphics.fillStyle(0xffff00, 1);
    collectibleGraphics.fillCircle(12, 12, 12);
    collectibleGraphics.generateTexture('collectible', 24, 24);
    collectibleGraphics.destroy();
  }

  create() {
    // 绘制背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建UI文本
    this.levelText = this.add.text(16, 16, `Level: ${this.level}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    this.scoreText = this.add.text(16, 48, `Score: ${this.score}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    this.messageText = this.add.text(400, 300, '', {
      fontSize: '32px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(32, 32);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 初始化第一关
    this.startLevel();
  }

  startLevel() {
    // 清除之前的收集物
    if (this.collectibles) {
      this.collectibles.clear(true, true);
    }

    // 创建收集物组
    this.collectibles = this.physics.add.group();

    // 根据关卡生成收集物数量（level * 3）
    const itemCount = this.level * 3;
    const seed = this.level * 1000; // 固定种子确保每关布局一致

    for (let i = 0; i < itemCount; i++) {
      // 使用伪随机但确定性的位置
      const x = 100 + ((seed + i * 137) % 600);
      const y = 80 + ((seed + i * 211) % 400);
      
      const collectible = this.collectibles.create(x, y, 'collectible');
      collectible.body.setCircle(12);
      collectible.body.setAllowGravity(false);
      collectible.body.setImmovable(true);
    }

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this.collectItem,
      null,
      this
    );

    // 更新UI
    this.levelText.setText(`Level: ${this.level}`);
    this.messageText.setText('');
  }

  collectItem(player, collectible) {
    // 收集物品
    collectible.destroy();
    this.score += 10;
    this.scoreText.setText(`Score: ${this.score}`);

    // 检查是否收集完所有物品
    if (this.collectibles.countActive(true) === 0) {
      this.levelComplete();
    }
  }

  levelComplete() {
    if (this.level < this.maxLevel) {
      // 进入下一关
      this.level++;
      this.messageText.setText(`Level ${this.level - 1} Complete!`);
      
      // 延迟1秒后开始下一关
      this.time.delayedCall(1000, () => {
        this.startLevel();
      });
    } else {
      // 游戏胜利
      this.messageText.setText('🎉 YOU WIN! All 12 Levels Complete! 🎉');
      this.physics.pause();
    }
  }

  update() {
    if (!this.player || !this.player.body) {
      return;
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
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 暴露状态变量供验证
game.scene.scenes[0].events.on('create', function() {
  window.gameState = {
    getLevel: () => game.scene.scenes[0].level,
    getScore: () => game.scene.scenes[0].score,
    getMaxLevel: () => game.scene.scenes[0].maxLevel,
    getCollectiblesCount: () => {
      const scene = game.scene.scenes[0];
      return scene.collectibles ? scene.collectibles.countActive(true) : 0;
    }
  };
});