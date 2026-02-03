// 全局状态信号
window.__signals__ = {
  currentLevel: 1,
  enemiesRemaining: 15,
  enemiesDestroyed: 0,
  totalLevels: 5,
  gameComplete: false,
  logs: []
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.totalLevels = 5;
    this.baseEnemyCount = 15;
    this.enemyIncrement = 2;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建纹理
    this.createTextures();
    
    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);
    
    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });
    
    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    
    // 创建UI文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff'
    });
    
    this.enemyCountText = this.add.text(16, 48, '', {
      fontSize: '20px',
      fill: '#00ffff'
    });
    
    this.messageText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);
    
    // 射击冷却
    this.canShoot = true;
    this.shootDelay = 200;
    
    // 开始第一关
    this.startLevel(this.currentLevel);
  }

  createTextures() {
    // 创建玩家纹理（绿色三角形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(16, 0);
    playerGraphics.lineTo(32, 32);
    playerGraphics.lineTo(0, 32);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();
    
    // 创建敌人纹理（青色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ffff, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();
    
    // 创建子弹纹理（黄色小矩形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 4, 12);
    bulletGraphics.generateTexture('bullet', 4, 12);
    bulletGraphics.destroy();
  }

  startLevel(level) {
    this.currentLevel = level;
    const enemyCount = this.baseEnemyCount + (level - 1) * this.enemyIncrement;
    
    // 清除现有敌人
    this.enemies.clear(true, true);
    
    // 生成敌人（使用固定随机种子保证确定性）
    const seed = level * 1000;
    for (let i = 0; i < enemyCount; i++) {
      // 简单的伪随机生成位置
      const x = 50 + ((seed + i * 137) % 700);
      const y = 50 + ((seed + i * 197) % 300);
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        ((seed + i * 73) % 100) - 50,
        ((seed + i * 113) % 60) + 20
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }
    
    // 更新UI
    this.updateUI();
    
    // 更新全局状态
    window.__signals__.currentLevel = level;
    window.__signals__.enemiesRemaining = enemyCount;
    window.__signals__.logs.push({
      timestamp: Date.now(),
      event: 'level_start',
      level: level,
      enemyCount: enemyCount
    });
    
    // 显示关卡开始信息
    this.messageText.setText(`Level ${level} Start!\n${enemyCount} Enemies`);
    this.time.delayedCall(2000, () => {
      this.messageText.setText('');
    });
  }

  update(time, delta) {
    if (window.__signals__.gameComplete) {
      return;
    }
    
    // 玩家移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }
    
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-300);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(300);
    } else {
      this.player.setVelocityY(0);
    }
    
    // 射击
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.canShoot) {
      this.shoot();
    }
    
    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });
  }

  shoot() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
      
      this.canShoot = false;
      this.time.delayedCall(this.shootDelay, () => {
        this.canShoot = true;
      });
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();
    
    // 更新状态
    window.__signals__.enemiesDestroyed++;
    window.__signals__.enemiesRemaining = this.enemies.countActive(true);
    window.__signals__.logs.push({
      timestamp: Date.now(),
      event: 'enemy_destroyed',
      remaining: window.__signals__.enemiesRemaining
    });
    
    this.updateUI();
    
    // 检查是否清除所有敌人
    if (this.enemies.countActive(true) === 0) {
      this.levelComplete();
    }
  }

  levelComplete() {
    if (this.currentLevel < this.totalLevels) {
      // 进入下一关
      this.messageText.setText(`Level ${this.currentLevel} Complete!\nNext Level...`);
      
      window.__signals__.logs.push({
        timestamp: Date.now(),
        event: 'level_complete',
        level: this.currentLevel
      });
      
      this.time.delayedCall(2000, () => {
        this.startLevel(this.currentLevel + 1);
      });
    } else {
      // 游戏完成
      this.gameComplete();
    }
  }

  gameComplete() {
    window.__signals__.gameComplete = true;
    window.__signals__.logs.push({
      timestamp: Date.now(),
      event: 'game_complete',
      totalDestroyed: window.__signals__.enemiesDestroyed
    });
    
    this.messageText.setText(`All Levels Complete!\nTotal Enemies Destroyed: ${window.__signals__.enemiesDestroyed}`);
    this.messageText.setFontSize('28px');
    
    // 停止游戏更新
    this.physics.pause();
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.currentLevel}/${this.totalLevels}`);
    this.enemyCountText.setText(`Enemies: ${this.enemies.countActive(true)}`);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000033',
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