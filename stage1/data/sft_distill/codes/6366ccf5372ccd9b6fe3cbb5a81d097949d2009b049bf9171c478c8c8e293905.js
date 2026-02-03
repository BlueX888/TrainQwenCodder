// 无尽模式波次游戏
class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    
    // 游戏状态
    this.currentWave = 0;
    this.killCount = 0;
    this.baseEnemySpeed = 240;
    this.enemiesPerWave = 3;
    this.isGameOver = false;
    this.waveInProgress = false;
    
    // 用于验证的信号
    window.__signals__ = {
      wave: 0,
      kills: 0,
      enemiesAlive: 0,
      gameOver: false,
      events: []
    };
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 创建玩家纹理
    this.createPlayerTexture();
    
    // 创建敌人纹理
    this.createEnemyTexture();
    
    // 创建子弹纹理
    this.createBulletTexture();
    
    // 创建玩家
    this.player = this.physics.add.sprite(width / 2, height - 50, 'playerTex');
    this.player.setCollideWorldBounds(true);
    
    // 创建敌人组
    this.enemies = this.physics.add.group({
      runChildUpdate: true
    });
    
    // 创建子弹组
    this.bullets = this.physics.add.group({
      runChildUpdate: true
    });
    
    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFireTime = 0;
    this.fireRate = 250; // 毫秒
    
    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.playerHit, null, this);
    
    // UI 文本
    this.waveText = this.add.text(16, 16, 'Wave: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
    
    this.killText = this.add.text(16, 48, 'Kills: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
    
    this.statusText = this.add.text(width / 2, height / 2, '', {
      fontSize: '32px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // 开始第一波
    this.startNextWave();
    
    this.logEvent('game_start');
  }

  createPlayerTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillTriangle(16, 0, 0, 32, 32, 32);
    graphics.generateTexture('playerTex', 32, 32);
    graphics.destroy();
  }

  createEnemyTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('enemyTex', 32, 32);
    graphics.destroy();
  }

  createBulletTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1);
    graphics.fillRect(0, 0, 4, 10);
    graphics.generateTexture('bulletTex', 4, 10);
    graphics.destroy();
  }

  startNextWave() {
    if (this.isGameOver) return;
    
    this.currentWave++;
    this.waveInProgress = true;
    
    const enemyCount = this.enemiesPerWave + (this.currentWave - 1);
    const enemySpeed = this.baseEnemySpeed + (this.currentWave - 1) * 20;
    
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.statusText.setText(`Wave ${this.currentWave} - ${enemyCount} Enemies!`);
    
    this.updateSignals();
    this.logEvent('wave_start', { wave: this.currentWave, enemyCount, enemySpeed });
    
    // 显示波次信息 1.5 秒后开始生成敌人
    this.time.delayedCall(1500, () => {
      this.statusText.setText('');
      this.spawnWave(enemyCount, enemySpeed);
    });
  }

  spawnWave(count, speed) {
    const { width } = this.cameras.main;
    const spacing = width / (count + 1);
    
    for (let i = 0; i < count; i++) {
      const x = spacing * (i + 1);
      const y = 50;
      
      const enemy = this.enemies.create(x, y, 'enemyTex');
      enemy.setVelocityY(speed);
      enemy.setBounce(1, 0);
      enemy.setCollideWorldBounds(true);
      
      // 添加左右移动
      const direction = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
      enemy.setVelocityX(direction * speed * 0.5);
      
      enemy.enemySpeed = speed;
    }
    
    this.updateSignals();
    this.logEvent('enemies_spawned', { count });
  }

  fireBullet() {
    const now = this.time.now;
    if (now - this.lastFireTime < this.fireRate) return;
    
    this.lastFireTime = now;
    
    const bullet = this.bullets.create(this.player.x, this.player.y - 20, 'bulletTex');
    bullet.setVelocityY(-400);
    
    this.logEvent('bullet_fired');
  }

  hitEnemy(bullet, enemy) {
    bullet.destroy();
    enemy.destroy();
    
    this.killCount++;
    this.killText.setText(`Kills: ${this.killCount}`);
    
    this.updateSignals();
    this.logEvent('enemy_killed', { killCount: this.killCount });
    
    // 检查是否清空当前波
    if (this.enemies.countActive(true) === 0 && this.waveInProgress) {
      this.waveInProgress = false;
      this.logEvent('wave_complete', { wave: this.currentWave });
      
      // 2 秒后开始下一波
      this.time.delayedCall(2000, () => {
        this.startNextWave();
      });
    }
  }

  playerHit(player, enemy) {
    if (this.isGameOver) return;
    
    this.isGameOver = true;
    this.waveInProgress = false;
    
    // 停止所有敌人
    this.enemies.children.entries.forEach(e => {
      e.setVelocity(0, 0);
    });
    
    // 停止玩家
    this.player.setVelocity(0, 0);
    this.player.setTint(0xff0000);
    
    this.statusText.setText(`GAME OVER!\nWave: ${this.currentWave}\nKills: ${this.killCount}`);
    
    this.updateSignals();
    this.logEvent('game_over', { 
      finalWave: this.currentWave, 
      totalKills: this.killCount 
    });
    
    // 3 秒后重启
    this.time.delayedCall(3000, () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
    if (this.isGameOver) return;
    
    // 玩家移动
    const speed = 300;
    
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }
    
    // 射击
    if (this.spaceKey.isDown) {
      this.fireBullet();
    }
    
    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.y < -10) {
        bullet.destroy();
      }
    });
    
    // 更新信号（每秒更新一次）
    if (time % 1000 < 16) {
      this.updateSignals();
    }
  }

  updateSignals() {
    window.__signals__.wave = this.currentWave;
    window.__signals__.kills = this.killCount;
    window.__signals__.enemiesAlive = this.enemies.countActive(true);
    window.__signals__.gameOver = this.isGameOver;
  }

  logEvent(eventType, data = {}) {
    const event = {
      time: this.time.now,
      type: eventType,
      ...data
    };
    window.__signals__.events.push(event);
    console.log('[EVENT]', JSON.stringify(event));
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: EndlessWaveScene
};

// 启动游戏
const game = new Phaser.Game(config);

// 导出游戏实例用于测试
window.__game__ = game;