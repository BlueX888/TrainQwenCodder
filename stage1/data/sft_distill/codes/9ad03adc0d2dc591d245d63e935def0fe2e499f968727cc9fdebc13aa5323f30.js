// 游戏状态信号输出
window.__signals__ = {
  currentLevel: 1,
  enemiesRemaining: 3,
  enemiesDestroyed: 0,
  totalLevels: 5,
  gameComplete: false,
  logs: []
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.enemiesPerLevel = 0;
    this.enemiesDestroyed = 0;
  }

  preload() {
    // 使用 Graphics 生成纹理，无需外部资源
  }

  create() {
    // 创建纹理
    this.createTextures();
    
    // 初始化关卡
    this.initLevel();
    
    // 创建玩家
    this.createPlayer();
    
    // 创建敌人组
    this.createEnemies();
    
    // 创建UI
    this.createUI();
    
    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);
    
    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 记录日志
    this.logSignal('Level started', { level: this.currentLevel, enemies: this.enemiesPerLevel });
  }

  createTextures() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();
    
    // 创建敌人纹理（蓝色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x0066ff, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();
    
    // 创建子弹纹理（黄色小圆）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  initLevel() {
    // 计算当前关卡敌人数量：第1关3个，每关+2
    this.enemiesPerLevel = 3 + (this.currentLevel - 1) * 2;
    this.enemiesDestroyed = 0;
    
    // 更新全局信号
    window.__signals__.currentLevel = this.currentLevel;
    window.__signals__.enemiesRemaining = this.enemiesPerLevel;
    window.__signals__.enemiesDestroyed = 0;
  }

  createPlayer() {
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(28, 28);
    
    // 子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 10
    });
    
    // 子弹与敌人碰撞
    this.physics.add.overlap(this.bullets, this.enemies, this.bulletHitEnemy, null, this);
  }

  createEnemies() {
    this.enemies = this.physics.add.group();
    
    // 使用固定种子生成敌人位置（保证确定性）
    const seed = this.currentLevel * 1000;
    
    for (let i = 0; i < this.enemiesPerLevel; i++) {
      // 伪随机位置生成（确定性）
      const x = 100 + ((seed + i * 137) % 600);
      const y = 50 + ((seed + i * 239) % 200);
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
      enemy.body.setSize(28, 28);
      
      // 设置随机速度（基于种子确定性）
      const vx = 50 + ((seed + i * 97) % 100) - 50;
      const vy = 50 + ((seed + i * 193) % 100) - 50;
      enemy.setVelocity(vx, vy);
      
      // 标记敌人ID
      enemy.enemyId = i + 1;
    }
  }

  createUI() {
    // 关卡信息
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 敌人数量信息
    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 操作提示
    this.add.text(16, 570, 'Arrow Keys: Move | SPACE: Shoot', {
      fontSize: '16px',
      fill: '#ffff00'
    });
    
    this.updateUI();
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.currentLevel} / ${this.maxLevel}`);
    const remaining = this.enemiesPerLevel - this.enemiesDestroyed;
    this.enemyCountText.setText(`Enemies: ${remaining} / ${this.enemiesPerLevel}`);
    
    // 更新信号
    window.__signals__.enemiesRemaining = remaining;
  }

  hitEnemy(player, enemy) {
    // 玩家直接触碰敌人也可以消灭（简化玩法）
    this.destroyEnemy(enemy);
  }

  bulletHitEnemy(bullet, enemy) {
    bullet.destroy();
    this.destroyEnemy(enemy);
  }

  destroyEnemy(enemy) {
    // 创建爆炸效果
    const explosion = this.add.graphics();
    explosion.fillStyle(0xff6600, 1);
    explosion.fillCircle(enemy.x, enemy.y, 20);
    
    this.tweens.add({
      targets: explosion,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => explosion.destroy()
    });
    
    // 记录日志
    this.logSignal('Enemy destroyed', { 
      enemyId: enemy.enemyId, 
      level: this.currentLevel 
    });
    
    enemy.destroy();
    this.enemiesDestroyed++;
    window.__signals__.enemiesDestroyed = this.enemiesDestroyed;
    
    this.updateUI();
    
    // 检查关卡完成
    if (this.enemiesDestroyed >= this.enemiesPerLevel) {
      this.levelComplete();
    }
  }

  levelComplete() {
    this.logSignal('Level complete', { level: this.currentLevel });
    
    if (this.currentLevel >= this.maxLevel) {
      // 游戏完成
      this.gameComplete();
    } else {
      // 进入下一关
      this.time.delayedCall(1000, () => {
        this.currentLevel++;
        this.scene.restart();
      });
    }
  }

  gameComplete() {
    window.__signals__.gameComplete = true;
    this.logSignal('Game complete', { totalLevels: this.maxLevel });
    
    // 显示胜利文本
    const victoryText = this.add.text(400, 300, 'VICTORY!\nAll Levels Complete!', {
      fontSize: '48px',
      fill: '#00ff00',
      align: 'center',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    victoryText.setOrigin(0.5);
    
    // 禁用输入
    this.input.keyboard.enabled = false;
  }

  shootBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.setSize(6, 6);
      bullet.setVelocityY(-300);
      
      // 子弹超出屏幕后销毁
      this.time.delayedCall(2000, () => {
        if (bullet.active) {
          bullet.destroy();
        }
      });
    }
  }

  logSignal(event, data) {
    const log = {
      timestamp: Date.now(),
      event: event,
      data: data
    };
    window.__signals__.logs.push(log);
    console.log('[SIGNAL]', JSON.stringify(log));
  }

  update(time, delta) {
    if (window.__signals__.gameComplete) {
      return;
    }
    
    // 玩家移动
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
    
    // 射击（防止连发）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.shootBullet();
    }
    
    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.y < -10) {
        bullet.destroy();
      }
    });
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
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
const game = new Phaser.Game(config);