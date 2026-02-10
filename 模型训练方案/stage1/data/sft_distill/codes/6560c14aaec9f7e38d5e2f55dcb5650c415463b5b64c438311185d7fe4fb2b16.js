class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.level = 1;
    this.score = 0;
    this.maxLevel = 12;
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x0066ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物纹理（绿色圆形）
    const collectibleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    collectibleGraphics.fillStyle(0x00ff00, 1);
    collectibleGraphics.fillCircle(12, 12, 12);
    collectibleGraphics.generateTexture('collectible', 24, 24);
    collectibleGraphics.destroy();

    // 创建地面纹理（灰色）
    const groundGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    groundGraphics.fillStyle(0x666666, 1);
    groundGraphics.fillRect(0, 0, 800, 40);
    groundGraphics.generateTexture('ground', 800, 40);
    groundGraphics.destroy();
  }

  create() {
    // 添加背景
    this.add.rectangle(400, 300, 800, 600, 0x1a1a2e);

    // 创建地面
    this.ground = this.physics.add.staticGroup();
    this.ground.create(400, 580, 'ground');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 500, 'player');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // 玩家与地面碰撞
    this.physics.add.collider(this.player, this.ground);

    // 创建收集物组
    this.collectibles = this.physics.add.group();

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // UI 文本
    this.levelText = this.add.text(16, 16, `Level: ${this.level}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.scoreText = this.add.text(16, 48, `Score: ${this.score}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.collectText = this.add.text(16, 80, '', {
      fontSize: '20px',
      fill: '#00ff00',
      fontFamily: 'Arial'
    });

    this.messageText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      align: 'center'
    });
    this.messageText.setOrigin(0.5);

    // 生成当前关卡
    this.generateLevel();

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this.collectItem,
      null,
      this
    );
  }

  generateLevel() {
    // 清空现有收集物
    this.collectibles.clear(true, true);

    // 根据关卡计算收集物数量（每关增加2个，最少5个）
    const itemCount = 5 + (this.level - 1) * 2;

    // 使用固定种子生成位置（关卡号作为种子）
    const seed = this.level * 12345;
    const random = this.seededRandom(seed);

    // 生成收集物
    for (let i = 0; i < itemCount; i++) {
      const x = 50 + random() * 700;
      const y = 100 + random() * 400;
      
      const collectible = this.collectibles.create(x, y, 'collectible');
      collectible.setBounce(0.5);
      collectible.setCollideWorldBounds(true);
      collectible.setVelocity(
        (random() - 0.5) * 100,
        (random() - 0.5) * 100
      );
    }

    // 收集物与地面碰撞
    this.physics.add.collider(this.collectibles, this.ground);

    // 更新UI
    this.updateUI();
  }

  seededRandom(seed) {
    let state = seed;
    return function() {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
  }

  collectItem(player, collectible) {
    // 移除收集物
    collectible.destroy();

    // 增加分数
    this.score += 10;

    // 更新UI
    this.updateUI();

    // 检查是否收集完所有物品
    if (this.collectibles.countActive(true) === 0) {
      this.levelComplete();
    }
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.level}`);
    this.scoreText.setText(`Score: ${this.score}`);
    
    const remaining = this.collectibles.countActive(true);
    this.collectText.setText(`Remaining: ${remaining}`);
  }

  levelComplete() {
    // 停止玩家移动
    this.player.setVelocity(0, 0);

    if (this.level < this.maxLevel) {
      // 进入下一关
      this.level++;
      this.messageText.setText(`Level ${this.level - 1} Complete!\nNext Level...`);

      // 延迟后生成新关卡
      this.time.delayedCall(1500, () => {
        this.messageText.setText('');
        this.player.setPosition(100, 500);
        this.generateLevel();
      });
    } else {
      // 完成所有关卡
      this.messageText.setText(`🎉 YOU WIN! 🎉\nAll ${this.maxLevel} Levels Complete!\nFinal Score: ${this.score}`);
      this.collectText.setText('');
      
      // 禁用输入
      this.cursors = null;
    }
  }

  update() {
    if (!this.cursors) return;

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃（只有在地面上才能跳）
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
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
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 暴露状态用于验证
game.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    level: scene.level,
    score: scene.score,
    maxLevel: scene.maxLevel,
    remainingItems: scene.collectibles ? scene.collectibles.countActive(true) : 0,
    isComplete: scene.level > scene.maxLevel || (scene.level === scene.maxLevel && scene.collectibles.countActive(true) === 0)
  };
};