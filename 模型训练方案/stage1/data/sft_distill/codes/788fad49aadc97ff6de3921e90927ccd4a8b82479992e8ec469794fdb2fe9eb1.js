class WaveSpawnerScene extends Phaser.Scene {
  constructor() {
    super('WaveSpawnerScene');
    
    // 游戏状态变量
    this.currentWave = 1;
    this.enemiesPerWave = 12;
    this.enemySpeed = 360;
    this.isWaveActive = false;
    this.isWaitingForNextWave = false;
    this.enemiesKilled = 0;
    this.totalEnemiesKilled = 0;
    
    // 固定随机种子
    this.rng = this.createSeededRandom(12345);
  }
  
  // 创建可预测的随机数生成器
  createSeededRandom(seed) {
    return function() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }
  
  preload() {
    // 无需预加载外部资源
  }
  
  create() {
    // 初始化 signals
    window.__signals__ = {
      wave: this.currentWave,
      enemiesKilled: this.totalEnemiesKilled,
      activeEnemies: 0,
      isWaveActive: false,
      isWaitingForNextWave: false
    };
    
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();
    
    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();
    
    // 创建子弹纹理（黄色小方块）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 8, 8);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
    
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);
    
    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 30
    });
    
    // 碰撞检测：子弹击中敌人
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    
    // 碰撞检测：玩家碰到敌人
    this.physics.add.overlap(this.player, this.enemies, this.playerHitEnemy, null, this);
    
    // 创建UI文本
    this.waveText = this.add.text(16, 16, `Wave: ${this.currentWave}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
    
    this.enemyCountText = this.add.text(16, 50, `Enemies: ${this.enemiesPerWave}`, {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
    
    this.statusText = this.add.text(16, 80, '', {
      fontSize: '18px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });
    
    this.killCountText = this.add.text(16, 110, `Total Kills: ${this.totalEnemiesKilled}`, {
      fontSize: '18px',
      fill: '#00ff00',
      fontFamily: 'Arial'
    });
    
    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFireTime = 0;
    this.fireRate = 200; // 每200ms可以发射一次
    
    // 开始第一波
    this.spawnWave();
    
    // 日志输出
    console.log(JSON.stringify({
      event: 'game_start',
      wave: this.currentWave,
      timestamp: Date.now()
    }));
  }
  
  spawnWave() {
    this.isWaveActive = true;
    this.isWaitingForNextWave = false;
    this.enemiesKilled = 0;
    
    this.statusText.setText(`Spawning Wave ${this.currentWave}...`);
    
    // 生成12个敌人
    for (let i = 0; i < this.enemiesPerWave; i++) {
      // 随机位置（上方区域）
      const x = 50 + this.rng() * 700;
      const y = 50 + this.rng() * 150;
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        (this.rng() - 0.5) * this.enemySpeed,
        this.rng() * this.enemySpeed * 0.5 + 100
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }
    
    this.updateUI();
    
    // 日志输出
    console.log(JSON.stringify({
      event: 'wave_spawned',
      wave: this.currentWave,
      enemyCount: this.enemiesPerWave,
      timestamp: Date.now()
    }));
    
    // 更新signals
    this.updateSignals();
  }
  
  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.destroy();
    enemy.destroy();
    
    this.enemiesKilled++;
    this.totalEnemiesKilled++;
    
    this.updateUI();
    this.updateSignals();
    
    // 日志输出
    console.log(JSON.stringify({
      event: 'enemy_killed',
      wave: this.currentWave,
      enemiesRemaining: this.enemies.countActive(true),
      totalKills: this.totalEnemiesKilled,
      timestamp: Date.now()
    }));
  }
  
  playerHitEnemy(player, enemy) {
    // 简单处理：销毁敌人（可扩展为玩家受伤逻辑）
    enemy.destroy();
    this.enemiesKilled++;
    this.totalEnemiesKilled++;
    
    this.updateUI();
    this.updateSignals();
  }
  
  updateUI() {
    const activeEnemies = this.enemies.countActive(true);
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.enemyCountText.setText(`Enemies: ${activeEnemies}`);
    this.killCountText.setText(`Total Kills: ${this.totalEnemiesKilled}`);
  }
  
  updateSignals() {
    window.__signals__ = {
      wave: this.currentWave,
      enemiesKilled: this.totalEnemiesKilled,
      activeEnemies: this.enemies.countActive(true),
      isWaveActive: this.isWaveActive,
      isWaitingForNextWave: this.isWaitingForNextWave
    };
  }
  
  startNextWave() {
    this.currentWave++;
    this.spawnWave();
    this.statusText.setText('');
  }
  
  fireBullet() {
    const currentTime = this.time.now;
    
    if (currentTime - this.lastFireTime < this.fireRate) {
      return;
    }
    
    this.lastFireTime = currentTime;
    
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
      
      // 子弹超出屏幕后销毁
      this.time.delayedCall(2000, () => {
        if (bullet.active) {
          bullet.destroy();
        }
      });
    }
  }
  
  update(time, delta) {
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
    
    // 发射子弹
    if (this.spaceKey.isDown) {
      this.fireBullet();
    }
    
    // 检查波次完成
    if (this.isWaveActive && !this.isWaitingForNextWave) {
      const activeEnemies = this.enemies.countActive(true);
      
      if (activeEnemies === 0) {
        this.isWaveActive = false;
        this.isWaitingForNextWave = true;
        
        this.statusText.setText('Wave Complete! Next wave in 2 seconds...');
        
        // 日志输出
        console.log(JSON.stringify({
          event: 'wave_complete',
          wave: this.currentWave,
          totalKills: this.totalEnemiesKilled,
          timestamp: Date.now()
        }));
        
        this.updateSignals();
        
        // 2秒后开始下一波
        this.time.delayedCall(2000, () => {
          this.startNextWave();
        });
      }
    }
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
  scene: WaveSpawnerScene
};

// 启动游戏
const game = new Phaser.Game(config);