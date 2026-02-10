// 紫色收集游戏 - 3关卡系统
class CollectionGame extends Phaser.Scene {
  constructor() {
    super('CollectionGame');
    this.score = 0;
    this.level = 1;
    this.maxLevel = 3;
    this.itemsPerLevel = [5, 8, 12]; // 每关需要收集的物品数量
    this.collectedItems = 0;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（紫色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x9b59b6, 1); // 紫色
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建收集物纹理（亮紫色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xd896ff, 1); // 亮紫色
    itemGraphics.fillCircle(15, 15, 15);
    itemGraphics.generateTexture('item', 30, 30);
    itemGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 40);

    // 创建收集物组
    this.items = this.physics.add.group();

    // 生成当前关卡的收集物
    this.generateItems();

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // UI 文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      fill: '#9b59b6',
      fontStyle: 'bold'
    });

    this.levelText = this.add.text(16, 50, 'Level: 1', {
      fontSize: '24px',
      fill: '#9b59b6',
      fontStyle: 'bold'
    });

    this.itemsText = this.add.text(16, 84, 'Items: 0/5', {
      fontSize: '20px',
      fill: '#d896ff'
    });

    // 提示文本
    this.hintText = this.add.text(400, 550, 'Use Arrow Keys to Move', {
      fontSize: '18px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // 游戏状态
    this.gameWon = false;

    // 背景色
    this.cameras.main.setBackgroundColor('#2c3e50');
  }

  generateItems() {
    // 清空现有物品
    this.items.clear(true, true);
    this.collectedItems = 0;

    const itemCount = this.itemsPerLevel[this.level - 1];
    
    // 使用固定种子生成物品位置（确定性）
    const seed = this.level * 1000;
    const positions = [];

    // 生成不重叠的位置
    for (let i = 0; i < itemCount; i++) {
      let x, y, valid;
      let attempts = 0;
      
      do {
        valid = true;
        // 使用伪随机生成位置
        x = 100 + ((seed + i * 137) % 600);
        y = 100 + ((seed + i * 197) % 350);
        
        // 检查是否与已有位置重叠
        for (let pos of positions) {
          const dist = Phaser.Math.Distance.Between(x, y, pos.x, pos.y);
          if (dist < 60) {
            valid = false;
            break;
          }
        }
        
        // 检查是否与玩家初始位置重叠
        if (Phaser.Math.Distance.Between(x, y, 400, 500) < 80) {
          valid = false;
        }
        
        attempts++;
      } while (!valid && attempts < 50);
      
      if (valid) {
        positions.push({ x, y });
        const item = this.items.create(x, y, 'item');
        item.body.setCircle(15);
        item.setData('value', 10); // 每个物品10分
      }
    }

    this.updateUI();
  }

  collectItem(player, item) {
    // 收集物品
    item.destroy();
    this.collectedItems++;
    this.score += item.getData('value');

    // 播放简单的收集效果（紫色闪烁）
    this.cameras.main.flash(100, 155, 89, 182, false);

    this.updateUI();

    // 检查是否完成当前关卡
    if (this.collectedItems >= this.itemsPerLevel[this.level - 1]) {
      this.completeLevel();
    }
  }

  completeLevel() {
    if (this.level < this.maxLevel) {
      // 进入下一关
      this.level++;
      
      // 显示关卡完成提示
      const levelCompleteText = this.add.text(400, 300, `Level ${this.level - 1} Complete!`, {
        fontSize: '32px',
        fill: '#d896ff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // 延迟后进入下一关
      this.time.delayedCall(1500, () => {
        levelCompleteText.destroy();
        this.generateItems();
        this.player.setPosition(400, 500);
      });
    } else {
      // 游戏胜利
      this.gameWon = true;
      this.showVictory();
    }
  }

  showVictory() {
    // 停止玩家移动
    this.player.body.setVelocity(0, 0);

    // 显示胜利信息
    const victoryBg = this.add.graphics();
    victoryBg.fillStyle(0x000000, 0.7);
    victoryBg.fillRect(0, 0, 800, 600);

    const victoryText = this.add.text(400, 250, 'VICTORY!', {
      fontSize: '48px',
      fill: '#d896ff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const finalScoreText = this.add.text(400, 320, `Final Score: ${this.score}`, {
      fontSize: '32px',
      fill: '#9b59b6',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const restartText = this.add.text(400, 380, 'Press SPACE to Restart', {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // 重启游戏
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.restart();
      this.score = 0;
      this.level = 1;
      this.collectedItems = 0;
      this.gameWon = false;
    });
  }

  updateUI() {
    this.scoreText.setText(`Score: ${this.score}`);
    this.levelText.setText(`Level: ${this.level}`);
    this.itemsText.setText(`Items: ${this.collectedItems}/${this.itemsPerLevel[this.level - 1]}`);
  }

  update(time, delta) {
    if (this.gameWon) {
      return; // 游戏胜利后停止更新
    }

    // 玩家移动控制
    const speed = 200;

    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(speed);
    } else {
      this.player.body.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.body.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.body.setVelocityY(speed);
    } else {
      this.player.body.setVelocityY(0);
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: CollectionGame,
  backgroundColor: '#2c3e50'
};

// 启动游戏
const game = new Phaser.Game(config);