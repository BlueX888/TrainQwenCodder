class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.level = 1;
    this.score = 0;
    this.maxLevel = 10;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x4444ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物纹理
    const collectibleGraphics = this.add.graphics();
    collectibleGraphics.fillStyle(0xffdd00, 1);
    collectibleGraphics.fillCircle(12, 12, 12);
    collectibleGraphics.generateTexture('collectible', 24, 24);
    collectibleGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(28, 28);

    // 创建收集物组
    this.collectibles = this.physics.add.group();
    this.createCollectibles();

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

    // 创建 UI 文本
    this.levelText = this.add.text(16, 16, `Level: ${this.level}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });

    this.scoreText = this.add.text(16, 50, `Score: ${this.score}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });

    this.itemsText = this.add.text(16, 84, '', {
      fontSize: '20px',
      fill: '#ffdd00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 3
    });

    this.updateItemsText();

    // 胜利文本（初始隐藏）
    this.winText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#00ff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.winText.setOrigin(0.5);
    this.winText.setVisible(false);
  }

  createCollectibles() {
    // 每关的收集物数量 = 3 + level
    const itemCount = 3 + this.level;
    
    // 使用固定种子生成位置（基于关卡）
    const seed = this.level * 1000;
    const positions = this.generatePositions(itemCount, seed);

    positions.forEach(pos => {
      const collectible = this.collectibles.create(pos.x, pos.y, 'collectible');
      collectible.setCircle(12);
      collectible.body.setAllowGravity(false);
      collectible.body.immovable = true;
    });
  }

  generatePositions(count, seed) {
    // 简单的伪随机数生成器（确定性）
    let random = seed;
    const nextRandom = () => {
      random = (random * 9301 + 49297) % 233280;
      return random / 233280;
    };

    const positions = [];
    const margin = 50;
    const minDistance = 80;

    for (let i = 0; i < count; i++) {
      let attempts = 0;
      let pos;
      
      do {
        pos = {
          x: margin + nextRandom() * (800 - 2 * margin),
          y: margin + nextRandom() * (600 - 2 * margin)
        };
        attempts++;
      } while (
        attempts < 50 &&
        (this.tooCloseToPlayer(pos) || this.tooCloseToOthers(pos, positions, minDistance))
      );

      positions.push(pos);
    }

    return positions;
  }

  tooCloseToPlayer(pos) {
    const dx = pos.x - 400;
    const dy = pos.y - 300;
    return Math.sqrt(dx * dx + dy * dy) < 100;
  }

  tooCloseToOthers(pos, others, minDist) {
    return others.some(other => {
      const dx = pos.x - other.x;
      const dy = pos.y - other.y;
      return Math.sqrt(dx * dx + dy * dy) < minDist;
    });
  }

  collectItem(player, collectible) {
    collectible.destroy();
    this.score += 10;
    this.scoreText.setText(`Score: ${this.score}`);
    this.updateItemsText();

    // 检查是否收集完所有物品
    if (this.collectibles.countActive() === 0) {
      this.nextLevel();
    }
  }

  nextLevel() {
    this.level++;

    if (this.level > this.maxLevel) {
      // 游戏通关
      this.showVictory();
    } else {
      // 进入下一关
      this.levelText.setText(`Level: ${this.level}`);
      
      // 重置玩家位置
      this.player.setPosition(400, 300);
      this.player.setVelocity(0, 0);

      // 创建新关卡的收集物
      this.createCollectibles();
      this.updateItemsText();

      // 显示关卡提示
      const levelUpText = this.add.text(400, 200, `Level ${this.level}!`, {
        fontSize: '36px',
        fill: '#ffff00',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 5
      });
      levelUpText.setOrigin(0.5);

      this.tweens.add({
        targets: levelUpText,
        alpha: 0,
        y: 150,
        duration: 1500,
        ease: 'Power2',
        onComplete: () => levelUpText.destroy()
      });
    }
  }

  showVictory() {
    this.winText.setText(`YOU WIN!\nFinal Score: ${this.score}`);
    this.winText.setVisible(true);
    this.player.setVelocity(0, 0);
    this.cursors = null; // 禁用控制

    // 添加闪烁效果
    this.tweens.add({
      targets: this.winText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }

  updateItemsText() {
    const remaining = this.collectibles.countActive();
    const total = 3 + this.level;
    this.itemsText.setText(`Items: ${total - remaining}/${total}`);
  }

  update(time, delta) {
    if (!this.cursors || this.level > this.maxLevel) return;

    const speed = 200;

    // 重置速度
    this.player.setVelocity(0);

    // 键盘控制
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

    // 对角线移动时标准化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(speed);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#333333',
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