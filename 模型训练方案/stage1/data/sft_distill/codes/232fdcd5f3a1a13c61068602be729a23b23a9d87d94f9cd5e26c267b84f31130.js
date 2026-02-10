// 无尽波次射击游戏
class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    this.wave = 1;
    this.kills = 0;
    this.enemiesInWave = 0;
    this.baseEnemySpeed = 160;
    this.baseEnemyCount = 10;
    this.isSpawning = false;
  }

  preload() {
    // 创建玩家纹理（绿色三角形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(16, 0);
    playerGraphics.lineTo(0, 32);
    playerGraphics.lineTo(32, 32);
    playerGraphics.closePath();
    playerGraphics.fill();
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建子弹纹理（黄色小矩形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 4, 10);
    bulletGraphics.generateTexture('bullet', 4, 10);
    bulletGraphics.destroy();
  }

  create() {
    // 初始化信号系统
    window.__signals__ = {
      wave: this.wave,
      kills: this.kills,
      enemiesAlive: 0,
      totalEnemiesInWave: 0,
      events: []
    };

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group({
      defaultKey: 'enemy',
      maxSize: 100
    });

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });

    // 碰撞检测：子弹击中敌人
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    // 碰撞检测：敌人撞到玩家（游戏结束）
    this.physics.add.overlap(this.player, this.enemies, this.gameOver, null, this);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 射击冷却
    this.canShoot = true;
    this.shootCooldown = 200; // 毫秒

    // UI文本
    this.waveText = this.add.text(16, 16, 'Wave: 1', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.killsText = this.add.text(16, 48, 'Kills: 0', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 开始第一波
    this.startWave();
  }

  startWave() {
    if (this.isSpawning) return;
    
    this.isSpawning = true;
    const enemyCount = this.baseEnemyCount + (this.wave - 1);
    const enemySpeed = this.baseEnemySpeed + (this.wave * 10);
    this.enemiesInWave = enemyCount;

    // 更新信号
    window.__signals__.wave = this.wave;
    window.__signals__.totalEnemiesInWave = enemyCount;
    window.__signals__.events.push({
      type: 'wave_start',
      wave: this.wave,
      enemyCount: enemyCount,
      enemySpeed: enemySpeed,
      timestamp: Date.now()
    });

    // 显示波次开始提示
    this.statusText.setText(`Wave ${this.wave} - ${enemyCount} Enemies!`);
    this.time.delayedCall(2000, () => {
      this.statusText.setText('');
    });

    // 分批生成敌人（避免一次性生成太多）
    let spawnedCount = 0;
    const spawnInterval = 500; // 每0.5秒生成一批

    const spawnTimer = this.time.addEvent({
      delay: spawnInterval,
      repeat: enemyCount - 1,
      callback: () => {
        this.spawnEnemy(enemySpeed);
        spawnedCount++;
        
        if (spawnedCount >= enemyCount) {
          this.isSpawning = false;
        }
      }
    });
  }

  spawnEnemy(speed) {
    // 随机生成位置（屏幕上方）
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.get(x, -50, 'enemy');
    
    if (enemy) {
      enemy.setActive(true);
      enemy.setVisible(true);
      enemy.body.enable = true;
      enemy.setVelocityY(speed);
      
      // 添加随机水平移动
      enemy.setVelocityX(Phaser.Math.Between(-50, 50));

      // 更新存活敌人数
      window.__signals__.enemiesAlive = this.enemies.countActive(true);
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.enable = false;

    enemy.setActive(false);
    enemy.setVisible(false);
    enemy.body.enable = false;

    // 更新击杀数
    this.kills++;
    this.killsText.setText(`Kills: ${this.kills}`);

    // 更新信号
    window.__signals__.kills = this.kills;
    window.__signals__.enemiesAlive = this.enemies.countActive(true);
    window.__signals__.events.push({
      type: 'enemy_killed',
      kills: this.kills,
      wave: this.wave,
      timestamp: Date.now()
    });

    // 检查是否完成当前波次
    this.checkWaveComplete();
  }

  checkWaveComplete() {
    const activeEnemies = this.enemies.countActive(true);
    
    if (activeEnemies === 0 && !this.isSpawning) {
      // 当前波次完成
      this.wave++;
      this.waveText.setText(`Wave: ${this.wave}`);

      // 更新信号
      window.__signals__.events.push({
        type: 'wave_complete',
        wave: this.wave - 1,
        totalKills: this.kills,
        timestamp: Date.now()
      });

      // 延迟3秒后开始下一波
      this.statusText.setText('Wave Complete! Next wave in 3s...');
      this.time.delayedCall(3000, () => {
        this.startWave();
      });
    }
  }

  shoot() {
    if (!this.canShoot) return;

    const bullet = this.bullets.get(this.player.x, this.player.y - 20, 'bullet');
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;
      bullet.setVelocityY(-400);

      // 设置射击冷却
      this.canShoot = false;
      this.time.delayedCall(this.shootCooldown, () => {
        this.canShoot = true;
      });
    }
  }

  gameOver(player, enemy) {
    // 游戏结束
    this.physics.pause();
    this.statusText.setText(`Game Over!\nWave: ${this.wave}\nKills: ${this.kills}`);
    
    // 更新信号
    window.__signals__.events.push({
      type: 'game_over',
      finalWave: this.wave,
      finalKills: this.kills,
      timestamp: Date.now()
    });

    // 3秒后重启
    this.time.delayedCall(3000, () => {
      this.scene.restart();
    });
  }

  update() {
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
    if (this.spaceKey.isDown) {
      this.shoot();
    }

    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -50) {
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.body.enable = false;
      }
    });

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && enemy.y > 650) {
        enemy.setActive(false);
        enemy.setVisible(false);
        enemy.body.enable = false;
        
        // 更新存活敌人数
        window.__signals__.enemiesAlive = this.enemies.countActive(true);
        
        // 检查波次完成
        this.checkWaveComplete();
      }
    });
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

// 输出初始信号
console.log('Game started. Access signals via window.__signals__');