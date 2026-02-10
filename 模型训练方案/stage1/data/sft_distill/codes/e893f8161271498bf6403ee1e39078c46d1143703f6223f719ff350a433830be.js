class CollectionGame extends Phaser.Scene {
  constructor() {
    super('CollectionGame');
    this.currentLevel = 1;
    this.totalScore = 0;
    this.itemsPerLevel = 5;
    this.collectedItems = 0;
    this.maxLevel = 20;
    this.seed = 12345; // 固定随机种子保证确定性
  }

  preload() {
    // 使用 Graphics 生成纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    this.createPlayerTexture();
    
    // 创建物品纹理
    this.createItemTexture();
    
    // 初始化物理系统
    this.physics.world.setBounds(0, 0, 800, 600);
    
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'playerTex');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(30, 30);
    
    // 创建物品组
    this.items = this.physics.add.group();
    
    // 创建UI文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
    
    this.scoreText = this.add.text(16, 50, '', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
    
    this.messageText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);
    
    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
    
    // 开始第一关
    this.startLevel();
  }

  createPlayerTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('playerTex', 32, 32);
    graphics.destroy();
  }

  createItemTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 12);
    graphics.lineStyle(2, 0xffff00, 1);
    graphics.strokeCircle(16, 16, 12);
    graphics.generateTexture('itemTex', 32, 32);
    graphics.destroy();
  }

  startLevel() {
    this.collectedItems = 0;
    this.messageText.setText('');
    
    // 清除旧物品
    this.items.clear(true, true);
    
    // 使用伪随机数生成器（基于关卡和种子）
    const levelSeed = this.seed + this.currentLevel * 1000;
    
    // 生成物品
    for (let i = 0; i < this.itemsPerLevel; i++) {
      const x = this.seededRandom(levelSeed + i * 10) * 700 + 50;
      const y = this.seededRandom(levelSeed + i * 10 + 1) * 500 + 50;
      
      const item = this.items.create(x, y, 'itemTex');
      item.body.setCircle(12);
      item.body.setOffset(4, 4);
      item.setData('value', 10); // 每个物品价值10分
    }
    
    // 更新UI
    this.updateUI();
  }

  // 简单的伪随机数生成器（确定性）
  seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  collectItem(player, item) {
    // 销毁物品
    item.destroy();
    
    // 增加分数
    const itemValue = item.getData('value');
    this.totalScore += itemValue;
    this.collectedItems++;
    
    // 更新UI
    this.updateUI();
    
    // 检查是否收集完本关所有物品
    if (this.collectedItems >= this.itemsPerLevel) {
      this.levelComplete();
    }
  }

  levelComplete() {
    this.currentLevel++;
    
    if (this.currentLevel > this.maxLevel) {
      // 游戏通关
      this.gameComplete();
    } else {
      // 显示过关信息
      this.messageText.setText(`Level ${this.currentLevel - 1} Complete!\nStarting Level ${this.currentLevel}...`);
      
      // 延迟后开始下一关
      this.time.delayedCall(2000, () => {
        this.startLevel();
      });
    }
  }

  gameComplete() {
    this.messageText.setText(`Congratulations!\nAll ${this.maxLevel} Levels Complete!\nFinal Score: ${this.totalScore}`);
    
    // 停止玩家移动
    this.player.body.setVelocity(0, 0);
    this.cursors = null;
    
    // 输出状态信号供验证
    console.log('Game Complete:', {
      level: this.currentLevel,
      score: this.totalScore,
      maxLevel: this.maxLevel
    });
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.currentLevel}/${this.maxLevel}`);
    this.scoreText.setText(`Score: ${this.totalScore}`);
    
    // 输出状态信号供验证
    console.log('State:', {
      level: this.currentLevel,
      score: this.totalScore,
      collected: this.collectedItems,
      total: this.itemsPerLevel
    });
  }

  update(time, delta) {
    if (!this.cursors) return;
    
    const speed = 200;
    
    // 重置速度
    this.player.body.setVelocity(0, 0);
    
    // 处理输入
    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(speed);
    }
    
    if (this.cursors.up.isDown) {
      this.player.body.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.body.setVelocityY(speed);
    }
    
    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      const normalizedSpeed = speed / Math.sqrt(2);
      this.player.body.velocity.normalize().scale(normalizedSpeed);
    }
  }
}

// 游戏配置
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
  scene: CollectionGame
};

// 创建游戏实例
const game = new Phaser.Game(config);