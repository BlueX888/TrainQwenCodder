class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.level = 1;
    this.score = 0;
    this.maxLevel = 10;
  }

  preload() {
    // 创建纹理用于精灵
    this.createTextures();
  }

  createTextures() {
    // 玩家纹理 - 紫色方块
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x9b59b6, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 收集物纹理 - 金色圆形
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xf1c40f, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();

    // 平台纹理 - 灰色矩形
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x34495e, 1);
    platformGraphics.fillRect(0, 0, 200, 32);
    platformGraphics.generateTexture('platform', 200, 32);
    platformGraphics.destroy();
  }

  create() {
    // 添加背景色
    this.cameras.main.setBackgroundColor('#2c3e50');

    // 创建 UI 文本
    this.levelText = this.add.text(16, 16, `Level: ${this.level}`, {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.scoreText = this.add.text(16, 48, `Score: ${this.score}`, {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // 创建平台组
    this.platforms = this.physics.add.staticGroup();
    
    // 创建收集物组
    this.items = this.physics.add.group();

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 初始化关卡
    this.setupLevel();

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 添加提示文本
    this.hintText = this.add.text(400, 100, '', {
      fontSize: '32px',
      fill: '#fff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  setupLevel() {
    // 清空现有平台和物品
    this.platforms.clear(true, true);
    this.items.clear(true, true);

    // 重置玩家位置
    this.player.setPosition(100, 450);
    this.player.setVelocity(0, 0);

    // 创建地面
    this.platforms.create(400, 584, 'platform').setScale(4, 1).refreshBody();

    // 根据关卡创建不同布局的平台
    const platformConfigs = this.getPlatformConfig(this.level);
    platformConfigs.forEach(config => {
      this.platforms.create(config.x, config.y, 'platform');
    });

    // 创建收集物
    const itemCount = Math.min(5 + this.level, 15); // 每关物品数量递增
    const itemConfigs = this.getItemConfig(this.level, itemCount);
    itemConfigs.forEach(config => {
      const item = this.items.create(config.x, config.y, 'item');
      item.setBounce(0.5);
      item.setCollideWorldBounds(true);
    });

    // 添加物品与平台的碰撞
    this.physics.add.collider(this.items, this.platforms);

    // 更新 UI
    this.levelText.setText(`Level: ${this.level}`);
    this.scoreText.setText(`Score: ${this.score}`);
  }

  getPlatformConfig(level) {
    // 使用固定种子生成平台配置
    const seed = level * 123;
    const random = this.seededRandom(seed);
    
    const configs = [
      { x: 200, y: 450 },
      { x: 400, y: 400 },
      { x: 600, y: 350 }
    ];

    // 根据关卡添加更多平台
    for (let i = 0; i < level; i++) {
      configs.push({
        x: 100 + random() * 600,
        y: 200 + random() * 200
      });
    }

    return configs;
  }

  getItemConfig(level, count) {
    // 使用固定种子生成物品配置
    const seed = level * 456;
    const random = this.seededRandom(seed);
    
    const configs = [];
    for (let i = 0; i < count; i++) {
      configs.push({
        x: 50 + random() * 700,
        y: 50 + random() * 300
      });
    }

    return configs;
  }

  // 简单的伪随机数生成器（确保确定性）
  seededRandom(seed) {
    let value = seed;
    return function() {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  }

  collectItem(player, item) {
    // 移除收集到的物品
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
      // 游戏完成
      this.showVictory();
    } else {
      // 显示关卡完成提示
      this.hintText.setText(`Level ${this.level - 1} Complete!`);
      
      // 延迟进入下一关
      this.time.delayedCall(1500, () => {
        this.hintText.setText('');
        this.setupLevel();
      });
    }
  }

  showVictory() {
    this.hintText.setText(`Victory! Final Score: ${this.score}`);
    this.hintText.setFontSize('48px');
    this.hintText.setColor('#f1c40f');
    
    // 禁用玩家控制
    this.player.setVelocity(0, 0);
    this.cursors = null;

    // 添加重新开始提示
    this.add.text(400, 400, 'Press SPACE to restart', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 添加重新开始功能
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.restart();
      this.level = 1;
      this.score = 0;
    });
  }

  update() {
    if (!this.cursors) return;

    // 玩家移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }
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