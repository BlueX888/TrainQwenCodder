class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.level = 1;
    this.score = 0;
    this.maxLevel = 8;
    this.itemsPerLevel = 5;
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建紫色收集物纹理（圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0x9b30ff, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('purpleItem', 24, 24);
    itemGraphics.destroy();

    // 创建地面纹理（绿色）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x00aa00, 1);
    groundGraphics.fillRect(0, 0, 800, 40);
    groundGraphics.generateTexture('ground', 800, 40);
    groundGraphics.destroy();
  }

  create() {
    // 添加背景色
    this.cameras.main.setBackgroundColor('#87ceeb');

    // 创建地面
    this.ground = this.physics.add.staticSprite(400, 580, 'ground');
    this.ground.setOrigin(0.5, 0.5);
    this.ground.refreshBody();

    // 创建玩家
    this.player = this.physics.add.sprite(100, 500, 'player');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // 玩家与地面碰撞
    this.physics.add.collider(this.player, this.ground);

    // 创建收集物组
    this.items = this.physics.add.group();

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.levelText = this.add.text(16, 16, `Level: ${this.level}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.levelText.setScrollFactor(0);

    this.scoreText = this.add.text(16, 50, `Score: ${this.score}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.scoreText.setScrollFactor(0);

    // 游戏状态文本（用于显示通关或进度）
    this.statusText = this.add.text(400, 100, '', {
      fontSize: '32px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 15, y: 10 }
    });
    this.statusText.setOrigin(0.5);
    this.statusText.setScrollFactor(0);

    // 碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 生成第一关
    this.generateLevel();
  }

  generateLevel() {
    // 清空现有物品
    this.items.clear(true, true);

    // 显示关卡开始提示
    this.statusText.setText(`Level ${this.level} Start!`);
    this.time.delayedCall(1500, () => {
      this.statusText.setText('');
    });

    // 根据关卡计算物品数量（每关增加）
    const itemCount = this.itemsPerLevel + (this.level - 1);

    // 使用固定种子生成位置（基于关卡数）
    const seed = this.level * 12345;
    const random = this.createSeededRandom(seed);

    // 生成紫色收集物
    for (let i = 0; i < itemCount; i++) {
      const x = random() * 700 + 50; // 50-750
      const y = random() * 400 + 50; // 50-450
      
      const item = this.items.create(x, y, 'purpleItem');
      item.setBounce(0.5);
      item.setCollideWorldBounds(true);
      item.setVelocity(
        (random() - 0.5) * 100,
        (random() - 0.5) * 100
      );
    }

    // 物品与地面碰撞
    this.physics.add.collider(this.items, this.ground);
    // 物品之间碰撞
    this.physics.add.collider(this.items, this.items);

    // 更新UI
    this.levelText.setText(`Level: ${this.level}`);
  }

  collectItem(player, item) {
    // 移除收集物
    item.destroy();

    // 增加分数（每关分数权重不同）
    this.score += this.level * 10;
    this.scoreText.setText(`Score: ${this.score}`);

    // 检查是否收集完所有物品
    if (this.items.countActive(true) === 0) {
      this.levelComplete();
    }
  }

  levelComplete() {
    // 关卡完成
    if (this.level < this.maxLevel) {
      this.level++;
      
      // 显示关卡完成提示
      this.statusText.setText('Level Complete!');
      
      // 延迟进入下一关
      this.time.delayedCall(2000, () => {
        this.generateLevel();
      });
    } else {
      // 游戏通关
      this.statusText.setText(`Game Complete! Final Score: ${this.score}`);
      this.statusText.setStyle({ fontSize: '28px' });
      
      // 停止玩家移动
      this.player.setVelocity(0, 0);
      this.gameComplete = true;
    }
  }

  update() {
    if (this.gameComplete) {
      return;
    }

    // 玩家移动控制
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

  // 创建可预测的随机数生成器
  createSeededRandom(seed) {
    let value = seed;
    return function() {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);