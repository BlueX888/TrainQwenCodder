class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.level = 1;
    this.maxLevel = 20;
    this.score = 0;
    this.itemsToCollect = 0;
    this.itemsCollected = 0;
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物纹理（黄色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();

    // 创建边界纹理（灰色）
    const wallGraphics = this.add.graphics();
    wallGraphics.fillStyle(0x666666, 1);
    wallGraphics.fillRect(0, 0, 32, 32);
    wallGraphics.generateTexture('wall', 32, 32);
    wallGraphics.destroy();
  }

  create() {
    // 创建边界墙
    this.createWalls();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);
    this.player.setMaxVelocity(300, 300);
    this.player.setDrag(800, 800);

    // 创建收集物组
    this.items = this.physics.add.group();

    // 创建墙壁组
    this.walls = this.physics.add.staticGroup();

    // 生成当前关卡
    this.generateLevel();

    // 设置碰撞
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
    this.physics.add.collider(this.player, this.walls);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // UI文本
    this.levelText = this.add.text(16, 16, `Level: ${this.level}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.levelText.setScrollFactor(0);
    this.levelText.setDepth(100);

    this.scoreText = this.add.text(16, 50, `Score: ${this.score}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.scoreText.setScrollFactor(0);
    this.scoreText.setDepth(100);

    this.progressText = this.add.text(16, 84, '', {
      fontSize: '20px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.progressText.setScrollFactor(0);
    this.progressText.setDepth(100);
    this.updateProgressText();
  }

  createWalls() {
    // 创建边界装饰墙（不影响碰撞，因为有世界边界）
    const wallSize = 32;
    const width = 800;
    const height = 600;

    // 顶部墙
    for (let x = 0; x < width; x += wallSize) {
      this.add.image(x, 0, 'wall').setOrigin(0, 0).setAlpha(0.5);
    }

    // 底部墙
    for (let x = 0; x < width; x += wallSize) {
      this.add.image(x, height - wallSize, 'wall').setOrigin(0, 0).setAlpha(0.5);
    }

    // 左侧墙
    for (let y = wallSize; y < height - wallSize; y += wallSize) {
      this.add.image(0, y, 'wall').setOrigin(0, 0).setAlpha(0.5);
    }

    // 右侧墙
    for (let y = wallSize; y < height - wallSize; y += wallSize) {
      this.add.image(width - wallSize, y, 'wall').setOrigin(0, 0).setAlpha(0.5);
    }
  }

  generateLevel() {
    // 清除现有收集物
    this.items.clear(true, true);

    // 计算当前关卡需要收集的物品数量
    this.itemsToCollect = 5 + this.level * 2;
    this.itemsCollected = 0;

    // 使用固定种子生成随机位置
    const seed = this.level * 12345;
    const random = this.createSeededRandom(seed);

    // 生成收集物
    const margin = 60;
    const maxAttempts = 100;

    for (let i = 0; i < this.itemsToCollect; i++) {
      let x, y, validPosition;
      let attempts = 0;

      do {
        x = margin + random() * (800 - margin * 2);
        y = margin + random() * (600 - margin * 2);
        
        // 检查是否离玩家太近
        const distToPlayer = Phaser.Math.Distance.Between(x, y, 400, 300);
        validPosition = distToPlayer > 100;

        // 检查是否与其他物品重叠
        if (validPosition) {
          const children = this.items.getChildren();
          for (let j = 0; j < children.length; j++) {
            const dist = Phaser.Math.Distance.Between(x, y, children[j].x, children[j].y);
            if (dist < 40) {
              validPosition = false;
              break;
            }
          }
        }

        attempts++;
      } while (!validPosition && attempts < maxAttempts);

      if (validPosition) {
        const item = this.items.create(x, y, 'item');
        item.setCircle(12);
        item.body.setAllowGravity(false);
        item.body.setImmovable(true);
      }
    }

    this.updateProgressText();
  }

  createSeededRandom(seed) {
    let state = seed;
    return function() {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
  }

  collectItem(player, item) {
    item.destroy();
    this.itemsCollected++;
    this.score += 10 * this.level;
    
    this.scoreText.setText(`Score: ${this.score}`);
    this.updateProgressText();

    // 播放收集效果（闪烁玩家）
    this.tweens.add({
      targets: this.player,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 1
    });

    // 检查是否收集完所有物品
    if (this.itemsCollected >= this.itemsToCollect) {
      this.advanceLevel();
    }
  }

  advanceLevel() {
    this.level++;

    if (this.level > this.maxLevel) {
      this.showVictory();
    } else {
      this.levelText.setText(`Level: ${this.level}`);
      
      // 显示关卡过渡
      const levelUpText = this.add.text(400, 300, `Level ${this.level}!`, {
        fontSize: '48px',
        fill: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      });
      levelUpText.setOrigin(0.5);
      levelUpText.setDepth(200);

      this.tweens.add({
        targets: levelUpText,
        alpha: 0,
        scale: 1.5,
        duration: 1500,
        onComplete: () => {
          levelUpText.destroy();
          this.generateLevel();
        }
      });

      // 重置玩家位置
      this.player.setPosition(400, 300);
      this.player.setVelocity(0, 0);
    }
  }

  showVictory() {
    const victoryText = this.add.text(400, 250, 'VICTORY!', {
      fontSize: '64px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 30, y: 15 }
    });
    victoryText.setOrigin(0.5);
    victoryText.setDepth(200);

    const finalScoreText = this.add.text(400, 330, `Final Score: ${this.score}`, {
      fontSize: '32px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    finalScoreText.setOrigin(0.5);
    finalScoreText.setDepth(200);

    const restartText = this.add.text(400, 380, 'Press SPACE to restart', {
      fontSize: '24px',
      fill: '#aaaaaa',
      backgroundColor: '#000000',
      padding: { x: 15, y: 8 }
    });
    restartText.setOrigin(0.5);
    restartText.setDepth(200);

    // 禁用玩家移动
    this.player.body.setVelocity(0, 0);
    this.player.body.setImmovable(true);

    // 空格键重新开始
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.restart();
      this.level = 1;
      this.score = 0;
      this.itemsToCollect = 0;
      this.itemsCollected = 0;
    });
  }

  updateProgressText() {
    this.progressText.setText(`Collected: ${this.itemsCollected}/${this.itemsToCollect}`);
  }

  update(time, delta) {
    if (this.level > this.maxLevel) {
      return; // 游戏结束，不再更新
    }

    // 玩家移动控制
    const speed = 300;

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
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
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