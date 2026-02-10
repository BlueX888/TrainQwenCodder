class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.level = 1;
    this.totalScore = 0;
    this.itemsPerLevel = 5;
    this.maxLevel = 8;
    this.seed = 12345; // 固定随机种子
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建橙色收集物纹理
    const itemGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    itemGraphics.fillStyle(0xff8800, 1);
    itemGraphics.fillCircle(15, 15, 15);
    itemGraphics.generateTexture('orange', 30, 30);
    itemGraphics.destroy();
  }

  create() {
    // 创建UI文本
    this.levelText = this.add.text(16, 16, `Level: ${this.level}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.scoreText = this.add.text(16, 50, `Score: ${this.totalScore}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.itemsLeftText = this.add.text(16, 84, '', {
      fontSize: '20px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.8);

    // 创建橙色收集物组
    this.items = this.physics.add.group();

    // 生成当前关卡的收集物
    this.generateItems();

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 胜利文本（初始隐藏）
    this.winText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#00ff00',
      fontFamily: 'Arial',
      align: 'center'
    });
    this.winText.setOrigin(0.5);
    this.winText.setVisible(false);

    // 更新剩余物品显示
    this.updateItemsLeft();
  }

  generateItems() {
    // 使用固定种子的伪随机数生成器
    const rng = this.createSeededRandom(this.seed + this.level);
    
    const itemCount = this.itemsPerLevel + (this.level - 1); // 每关增加难度
    const minDistance = 80; // 物品之间的最小距离

    const positions = [];
    let attempts = 0;
    const maxAttempts = 1000;

    while (positions.length < itemCount && attempts < maxAttempts) {
      attempts++;
      const x = rng() * 700 + 50; // 50-750
      const y = rng() * 400 + 50; // 50-450

      // 检查是否与玩家初始位置太近
      if (Math.abs(x - 400) < 100 && Math.abs(y - 500) < 100) {
        continue;
      }

      // 检查是否与其他物品太近
      let tooClose = false;
      for (const pos of positions) {
        const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        if (dist < minDistance) {
          tooClose = true;
          break;
        }
      }

      if (!tooClose) {
        positions.push({ x, y });
      }
    }

    // 创建收集物
    positions.forEach(pos => {
      const item = this.items.create(pos.x, pos.y, 'orange');
      item.setCircle(15);
      item.body.setAllowGravity(false);
      item.body.immovable = true;
    });
  }

  createSeededRandom(seed) {
    // 简单的伪随机数生成器
    let state = seed;
    return function() {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
  }

  collectItem(player, item) {
    // 收集物品
    item.destroy();
    this.totalScore += 10;
    this.scoreText.setText(`Score: ${this.totalScore}`);
    
    // 更新剩余物品显示
    this.updateItemsLeft();

    // 检查是否收集完所有物品
    if (this.items.countActive(true) === 0) {
      this.nextLevel();
    }
  }

  updateItemsLeft() {
    const itemsLeft = this.items.countActive(true);
    this.itemsLeftText.setText(`Items Left: ${itemsLeft}`);
  }

  nextLevel() {
    this.level++;

    if (this.level > this.maxLevel) {
      // 通关
      this.showVictory();
    } else {
      // 进入下一关
      this.levelText.setText(`Level: ${this.level}`);
      this.time.delayedCall(500, () => {
        this.generateItems();
        this.updateItemsLeft();
        // 重置玩家位置
        this.player.setPosition(400, 500);
        this.player.setVelocity(0, 0);
      });
    }
  }

  showVictory() {
    this.winText.setText(`VICTORY!\nAll ${this.maxLevel} Levels Complete!\nFinal Score: ${this.totalScore}`);
    this.winText.setVisible(true);
    this.player.setVelocity(0, 0);
    this.cursors = null; // 禁用输入
  }

  update(time, delta) {
    if (!this.cursors || this.level > this.maxLevel) {
      return;
    }

    // 玩家移动控制
    const speed = 300;

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
  scene: GameScene
};

const game = new Phaser.Game(config);

// 暴露状态供验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    level: scene.level,
    score: scene.totalScore,
    itemsLeft: scene.items ? scene.items.countActive(true) : 0,
    maxLevel: scene.maxLevel,
    isComplete: scene.level > scene.maxLevel
  };
};