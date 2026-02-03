class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.level = 1;
    this.totalScore = 0;
    this.itemsPerLevel = 5;
    this.maxLevel = 8;
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x0066ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建橙色收集物纹理（圆形）
    const itemGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    itemGraphics.fillStyle(0xff8800, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('orange', 24, 24);
    itemGraphics.destroy();
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setVelocity(0, 0);

    // 创建橙色收集物组
    this.items = this.physics.add.group();
    this.createItems();

    // 添加碰撞检测
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
    this.levelText = this.add.text(16, 16, `Level: ${this.level}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });

    this.scoreText = this.add.text(16, 48, `Score: ${this.totalScore}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });

    this.itemsText = this.add.text(16, 80, `Items: ${this.items.getLength()}`, {
      fontSize: '20px',
      color: '#ffaa00',
      fontFamily: 'Arial'
    });

    // 胜利文本（初始隐藏）
    this.winText = this.add.text(400, 300, '', {
      fontSize: '48px',
      color: '#00ff00',
      fontFamily: 'Arial',
      align: 'center'
    });
    this.winText.setOrigin(0.5);
    this.winText.setVisible(false);

    // 游戏状态
    this.gameWon = false;
  }

  createItems() {
    // 使用确定性随机位置（基于关卡的伪随机）
    const seed = this.level * 1000;
    const positions = [];
    
    // 生成不重叠的位置
    for (let i = 0; i < this.itemsPerLevel; i++) {
      let x, y, overlap;
      let attempts = 0;
      
      do {
        // 使用简单的伪随机算法
        const rand1 = ((seed + i * 137 + attempts * 17) % 700) + 50;
        const rand2 = ((seed + i * 211 + attempts * 29) % 400) + 50;
        x = rand1;
        y = rand2;
        
        overlap = false;
        for (let pos of positions) {
          const dist = Phaser.Math.Distance.Between(x, y, pos.x, pos.y);
          if (dist < 60) {
            overlap = true;
            break;
          }
        }
        attempts++;
      } while (overlap && attempts < 50);
      
      positions.push({ x, y });
      const item = this.items.create(x, y, 'orange');
      item.setCircle(12);
    }
  }

  collectItem(player, item) {
    // 收集物品
    item.destroy();
    this.totalScore += 10;
    
    // 更新UI
    this.scoreText.setText(`Score: ${this.totalScore}`);
    this.itemsText.setText(`Items: ${this.items.getLength()}`);

    // 检查是否收集完所有物品
    if (this.items.getLength() === 0) {
      this.levelComplete();
    }
  }

  levelComplete() {
    if (this.level >= this.maxLevel) {
      // 游戏胜利
      this.gameWon = true;
      this.winText.setText(`Victory!\nAll ${this.maxLevel} Levels Complete!\nFinal Score: ${this.totalScore}`);
      this.winText.setVisible(true);
      this.player.setVelocity(0, 0);
    } else {
      // 进入下一关
      this.level++;
      this.time.delayedCall(500, () => {
        this.resetLevel();
      });
    }
  }

  resetLevel() {
    // 重置玩家位置
    this.player.setPosition(400, 500);
    this.player.setVelocity(0, 0);

    // 创建新关卡的物品
    this.createItems();

    // 更新UI
    this.levelText.setText(`Level: ${this.level}`);
    this.itemsText.setText(`Items: ${this.items.getLength()}`);
  }

  update() {
    if (this.gameWon) {
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

  // 导出状态用于验证
  getGameState() {
    return {
      level: this.level,
      score: this.totalScore,
      itemsRemaining: this.items ? this.items.getLength() : 0,
      gameWon: this.gameWon
    };
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
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

// 导出游戏实例用于状态检查
if (typeof window !== 'undefined') {
  window.game = game;
  window.getGameState = function() {
    const scene = game.scene.scenes[0];
    return scene.getGameState();
  };
}