class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.level = 1;
    this.score = 0;
    this.maxLevel = 10;
    this.itemsPerLevel = 5;
    this.seed = 12345; // 固定随机种子
  }

  preload() {
    // 创建玩家纹理（紫色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x9932CC, 1); // 深紫色
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建收集物品纹理（浅紫色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xDA70D6, 1); // 浅紫色
    itemGraphics.fillCircle(15, 15, 15);
    itemGraphics.generateTexture('item', 30, 30);
    itemGraphics.destroy();

    // 创建背景纹理（淡紫色）
    const bgGraphics = this.add.graphics();
    bgGraphics.fillStyle(0xE6E6FA, 1); // 薰衣草色
    bgGraphics.fillRect(0, 0, 800, 600);
    bgGraphics.generateTexture('background', 800, 600);
    bgGraphics.destroy();
  }

  create() {
    // 添加背景
    this.add.image(400, 300, 'background');

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);
    this.player.setDamping(true);
    this.player.setDrag(0.95);

    // 创建收集物品组
    this.items = this.physics.add.group();

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.levelText = this.add.text(16, 16, `Level: ${this.level}`, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#9932CC',
      fontStyle: 'bold'
    });

    this.scoreText = this.add.text(16, 50, `Score: ${this.score}`, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#9932CC',
      fontStyle: 'bold'
    });

    this.messageText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#9932CC',
      fontStyle: 'bold'
    });
    this.messageText.setOrigin(0.5);

    // 碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 生成第一关物品
    this.generateLevel();
  }

  generateLevel() {
    // 清空现有物品
    this.items.clear(true, true);

    // 使用固定种子生成伪随机位置
    const positions = this.generateRandomPositions(
      this.itemsPerLevel + this.level - 1, // 每关增加物品数量
      this.seed + this.level
    );

    // 生成物品
    positions.forEach(pos => {
      const item = this.items.create(pos.x, pos.y, 'item');
      item.setCircle(15);
      item.body.setAllowGravity(false);
      item.setImmovable(true);
    });

    // 显示关卡信息
    this.showMessage(`Level ${this.level}`, 1000);
  }

  generateRandomPositions(count, seed) {
    // 简单的伪随机数生成器
    let currentSeed = seed;
    const random = () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };

    const positions = [];
    const margin = 60;
    
    for (let i = 0; i < count; i++) {
      let x, y, valid;
      let attempts = 0;
      
      do {
        x = margin + random() * (800 - 2 * margin);
        y = margin + random() * (600 - 2 * margin);
        valid = true;
        
        // 检查是否与玩家初始位置太近
        if (Math.abs(x - 400) < 80 && Math.abs(y - 300) < 80) {
          valid = false;
        }
        
        // 检查是否与其他物品太近
        for (let pos of positions) {
          const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
          if (dist < 50) {
            valid = false;
            break;
          }
        }
        
        attempts++;
      } while (!valid && attempts < 100);
      
      positions.push({ x, y });
    }
    
    return positions;
  }

  collectItem(player, item) {
    // 移除物品
    item.destroy();
    
    // 增加分数
    this.score += 10;
    this.scoreText.setText(`Score: ${this.score}`);

    // 检查是否收集完所有物品
    if (this.items.countActive(true) === 0) {
      this.nextLevel();
    }
  }

  nextLevel() {
    this.level++;
    
    if (this.level > this.maxLevel) {
      // 游戏胜利
      this.showMessage('YOU WIN!', 0);
      this.physics.pause();
      this.input.keyboard.enabled = false;
    } else {
      // 进入下一关
      this.levelText.setText(`Level: ${this.level}`);
      this.generateLevel();
    }
  }

  showMessage(text, duration) {
    this.messageText.setText(text);
    this.messageText.setAlpha(1);
    
    if (duration > 0) {
      this.time.delayedCall(duration, () => {
        this.tweens.add({
          targets: this.messageText,
          alpha: 0,
          duration: 500
        });
      });
    }
  }

  update(time, delta) {
    if (!this.player || !this.player.body) return;

    const speed = 300;

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

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      const factor = Math.sqrt(2) / 2;
      this.player.setVelocity(
        this.player.body.velocity.x * factor,
        this.player.body.velocity.y * factor
      );
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#E6E6FA',
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