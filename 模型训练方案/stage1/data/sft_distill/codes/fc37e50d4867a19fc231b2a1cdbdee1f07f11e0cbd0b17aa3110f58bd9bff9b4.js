// 完整的 Phaser3 多关卡游戏代码
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.baseEnemyCount = 15;
    this.enemyIncrement = 2;
    this.enemiesKilled = 0;
    this.totalEnemies = 0;
  }

  preload() {
    // 使用 Graphics 生成纹理，无需外部资源
  }

  create() {
    // 初始化 signals 记录
    window.__signals__ = {
      level: this.currentLevel,
      enemiesKilled: 0,
      totalEnemies: 0,
      gameComplete: false,
      events: []
    };

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（橙色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff8800, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建UI文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(400, 550, '使用方向键移动，碰触敌人消灭它们', {
      fontSize: '18px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    this.messageText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setVisible(false);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 玩家与敌人碰撞
    this.physics.add.overlap(this.player, this.enemies, this.killEnemy, null, this);

    // 开始第一关
    this.startLevel(this.currentLevel);
  }

  startLevel(level) {
    this.currentLevel = level;
    this.enemiesKilled = 0;
    
    // 计算当前关卡敌人数量
    this.totalEnemies = this.baseEnemyCount + (level - 1) * this.enemyIncrement;
    
    // 更新UI
    this.updateUI();
    
    // 清空现有敌人
    this.enemies.clear(true, true);
    
    // 生成敌人
    this.spawnEnemies(this.totalEnemies);
    
    // 记录关卡开始
    this.logSignal('level_start', {
      level: level,
      totalEnemies: this.totalEnemies
    });

    // 显示关卡提示
    this.showMessage(`第 ${level} 关`, 1500);
  }

  spawnEnemies(count) {
    // 使用固定种子生成确定性位置
    const positions = [];
    const seed = this.currentLevel * 1000;
    
    for (let i = 0; i < count; i++) {
      let x, y;
      let validPosition = false;
      let attempts = 0;
      
      // 确保敌人不与玩家初始位置重叠
      while (!validPosition && attempts < 50) {
        // 伪随机位置生成（基于种子和索引）
        const pseudoRandom = Math.sin(seed + i * 12.9898 + attempts * 78.233) * 43758.5453;
        const random = pseudoRandom - Math.floor(pseudoRandom);
        
        x = 50 + random * 700;
        
        const pseudoRandom2 = Math.sin(seed + i * 45.123 + attempts * 91.456) * 23421.6789;
        const random2 = pseudoRandom2 - Math.floor(pseudoRandom2);
        
        y = 50 + random2 * 500;
        
        // 检查是否与玩家距离足够远
        const distToPlayer = Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y);
        if (distToPlayer > 100) {
          validPosition = true;
        }
        attempts++;
      }
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
      
      // 设置随机速度（确定性）
      const speedSeed = seed + i * 67.890;
      const vxRandom = Math.sin(speedSeed) * 43758.5453;
      const vyRandom = Math.cos(speedSeed) * 43758.5453;
      
      const vx = (vxRandom - Math.floor(vxRandom)) * 200 - 100;
      const vy = (vyRandom - Math.floor(vyRandom)) * 200 - 100;
      
      enemy.setVelocity(vx, vy);
    }
  }

  killEnemy(player, enemy) {
    enemy.destroy();
    this.enemiesKilled++;
    
    // 更新UI
    this.updateUI();
    
    // 记录击杀
    this.logSignal('enemy_killed', {
      level: this.currentLevel,
      enemiesKilled: this.enemiesKilled,
      remaining: this.totalEnemies - this.enemiesKilled
    });
    
    // 检查是否完成关卡
    if (this.enemiesKilled >= this.totalEnemies) {
      this.completeLevel();
    }
  }

  completeLevel() {
    this.logSignal('level_complete', {
      level: this.currentLevel
    });

    if (this.currentLevel >= this.maxLevel) {
      // 游戏完成
      this.gameComplete();
    } else {
      // 进入下一关
      this.showMessage(`第 ${this.currentLevel} 关完成！`, 2000);
      
      this.time.delayedCall(2000, () => {
        this.startLevel(this.currentLevel + 1);
      });
    }
  }

  gameComplete() {
    this.showMessage('恭喜通关！所有关卡完成！', 0);
    
    this.logSignal('game_complete', {
      totalLevels: this.maxLevel
    });

    window.__signals__.gameComplete = true;
    
    // 停止玩家移动
    this.player.setVelocity(0, 0);
    this.physics.pause();
  }

  showMessage(text, duration) {
    this.messageText.setText(text);
    this.messageText.setVisible(true);
    
    if (duration > 0) {
      this.time.delayedCall(duration, () => {
        this.messageText.setVisible(false);
      });
    }
  }

  updateUI() {
    this.levelText.setText(`关卡: ${this.currentLevel} / ${this.maxLevel}`);
    this.enemyCountText.setText(`敌人: ${this.enemiesKilled} / ${this.totalEnemies}`);
    
    // 更新 signals
    window.__signals__.level = this.currentLevel;
    window.__signals__.enemiesKilled = this.enemiesKilled;
    window.__signals__.totalEnemies = this.totalEnemies;
  }

  logSignal(eventType, data) {
    const signal = {
      timestamp: Date.now(),
      type: eventType,
      ...data
    };
    
    window.__signals__.events.push(signal);
    console.log('[SIGNAL]', JSON.stringify(signal));
  }

  update(time, delta) {
    if (this.physics.world.isPaused) {
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
  scene: GameScene
};

// 启动游戏
new Phaser.Game(config);