class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    this.currentWave = 0;
    this.killCount = 0;
    this.enemiesInWave = 0;
    this.enemiesKilled = 0;
    this.baseEnemyCount = 15;
    this.baseEnemySpeed = 80;
    this.waveActive = false;
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
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

  create() {
    // 初始化信号对象
    window.__signals__ = {
      wave: 0,
      kills: 0,
      enemiesAlive: 0,
      waveActive: false,
      timestamp: Date.now()
    };

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFireTime = 0;

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.gameOver, null, this);

    // UI文本
    this.waveText = this.add.text(16, 16, 'Wave: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.killText = this.add.text(16, 50, 'Kills: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.enemyCountText = this.add.text(16, 84, 'Enemies: 0', {
      fontSize: '20px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });

    // 开始第一波
    this.startNextWave();

    // 日志输出
    console.log(JSON.stringify({
      event: 'game_start',
      timestamp: Date.now()
    }));
  }

  startNextWave() {
    this.currentWave++;
    this.enemiesKilled = 0;
    this.enemiesInWave = this.baseEnemyCount + (this.currentWave - 1);
    this.waveActive = true;

    // 计算当前波次敌人速度（每波增加5）
    const currentSpeed = this.baseEnemySpeed + (this.currentWave - 1) * 5;

    // 更新UI
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.enemyCountText.setText(`Enemies: ${this.enemiesInWave}`);

    // 更新信号
    window.__signals__.wave = this.currentWave;
    window.__signals__.waveActive = true;
    window.__signals__.enemiesAlive = this.enemiesInWave;

    // 日志输出
    console.log(JSON.stringify({
      event: 'wave_start',
      wave: this.currentWave,
      enemyCount: this.enemiesInWave,
      enemySpeed: currentSpeed,
      timestamp: Date.now()
    }));

    // 生成敌人（分批生成，避免一次性生成太多）
    let spawnedCount = 0;
    const spawnInterval = 200; // 每200ms生成一个

    const spawnTimer = this.time.addEvent({
      delay: spawnInterval,
      callback: () => {
        if (spawnedCount < this.enemiesInWave) {
          this.spawnEnemy(currentSpeed);
          spawnedCount++;
        } else {
          spawnTimer.remove();
        }
      },
      loop: true
    });
  }

  spawnEnemy(speed) {
    // 随机从顶部生成敌人
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -32, 'enemy');
    
    if (enemy) {
      enemy.setVelocityY(speed);
      enemy.setCollideWorldBounds(false);
      
      // 敌人离开屏幕底部时销毁
      enemy.setData('checkBounds', true);
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.destroy();
    enemy.destroy();

    // 更新击杀数
    this.killCount++;
    this.enemiesKilled++;
    this.killText.setText(`Kills: ${this.killCount}`);

    // 更新敌人计数
    const remainingEnemies = this.enemiesInWave - this.enemiesKilled;
    this.enemyCountText.setText(`Enemies: ${remainingEnemies}`);

    // 更新信号
    window.__signals__.kills = this.killCount;
    window.__signals__.enemiesAlive = this.enemies.countActive(true);

    // 日志输出
    console.log(JSON.stringify({
      event: 'enemy_killed',
      kills: this.killCount,
      wave: this.currentWave,
      remaining: remainingEnemies,
      timestamp: Date.now()
    }));

    // 检查是否完成当前波次
    if (this.enemiesKilled >= this.enemiesInWave && this.enemies.countActive(true) === 0) {
      this.completeWave();
    }
  }

  completeWave() {
    this.waveActive = false;
    window.__signals__.waveActive = false;

    // 日志输出
    console.log(JSON.stringify({
      event: 'wave_complete',
      wave: this.currentWave,
      totalKills: this.killCount,
      timestamp: Date.now()
    }));

    // 2秒后开始下一波
    this.time.delayedCall(2000, () => {
      this.startNextWave();
    });
  }

  fireBullet() {
    const currentTime = this.time.now;
    if (currentTime - this.lastFireTime < 250) {
      return; // 射击冷却时间250ms
    }

    this.lastFireTime = currentTime;

    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
    }
  }

  gameOver() {
    console.log(JSON.stringify({
      event: 'game_over',
      wave: this.currentWave,
      kills: this.killCount,
      timestamp: Date.now()
    }));

    this.physics.pause();
    this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    window.__signals__.gameOver = true;
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

    // 射击
    if (this.spaceKey.isDown) {
      this.fireBullet();
    }

    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.destroy();
      }
    });

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && enemy.y > 610) {
        enemy.destroy();
        
        // 如果敌人逃脱，检查波次是否完成
        if (this.waveActive) {
          this.enemiesKilled++; // 计入已处理的敌人
          const remainingEnemies = this.enemiesInWave - this.enemiesKilled;
          this.enemyCountText.setText(`Enemies: ${remainingEnemies}`);
          
          if (this.enemiesKilled >= this.enemiesInWave && this.enemies.countActive(true) === 0) {
            this.completeWave();
          }
        }
      }
    });

    // 更新信号
    window.__signals__.enemiesAlive = this.enemies.countActive(true);
    window.__signals__.timestamp = Date.now();
  }
}

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

new Phaser.Game(config);