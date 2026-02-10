// 波次敌人生成系统
class WaveSpawnerScene extends Phaser.Scene {
  constructor() {
    super('WaveSpawnerScene');
    this.currentWave = 0;
    this.enemiesPerWave = 15;
    this.enemySpeed = 80;
    this.waveDelay = 2000; // 2秒延迟
    this.totalEnemiesKilled = 0;
    this.isWaveActive = false;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 初始化 signals
    window.__signals__ = {
      currentWave: 0,
      enemiesRemaining: 0,
      totalKilled: 0,
      isWaveActive: false,
      waveStartTimes: [],
      waveEndTimes: []
    };

    // 创建玩家纹理（红色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0xff0000, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（绿色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ff00, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建子弹纹理（黄色小圆）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
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
      maxSize: 50
    });

    // 碰撞检测：子弹与敌人
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 鼠标射击
    this.input.on('pointerdown', (pointer) => {
      this.shootBullet(pointer);
    });

    // UI文本
    this.waveText = this.add.text(16, 16, 'Wave: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.enemyCountText = this.add.text(16, 48, 'Enemies: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(16, 80, 'Status: Ready', {
      fontSize: '18px',
      fill: '#00ff00'
    });

    this.killCountText = this.add.text(16, 112, 'Total Killed: 0', {
      fontSize: '18px',
      fill: '#ffff00'
    });

    // 开始第一波
    this.startNextWave();
  }

  update(time, delta) {
    // 玩家移动
    const speed = 200;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 敌人追踪玩家
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active) {
        this.physics.moveToObject(enemy, this.player, this.enemySpeed);
      }
    });

    // 更新UI
    this.updateUI();

    // 检查是否所有敌人被消灭
    if (this.isWaveActive && this.enemies.countActive(true) === 0) {
      this.completeWave();
    }
  }

  startNextWave() {
    this.currentWave++;
    this.isWaveActive = true;

    // 记录波次开始时间
    window.__signals__.waveStartTimes.push(Date.now());
    window.__signals__.currentWave = this.currentWave;
    window.__signals__.isWaveActive = true;

    this.statusText.setText('Status: Wave Active');
    this.statusText.setColor('#ff0000');

    // 生成敌人
    this.spawnEnemies();

    console.log(`[WAVE ${this.currentWave}] Started with ${this.enemiesPerWave} enemies`);
  }

  spawnEnemies() {
    const spawnPositions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 }
    ];

    for (let i = 0; i < this.enemiesPerWave; i++) {
      // 使用固定随机模式确保可重现
      const spawnIndex = i % spawnPositions.length;
      const basePos = spawnPositions[spawnIndex];
      
      // 添加偏移避免重叠
      const offsetX = (i % 5) * 40;
      const offsetY = Math.floor(i / 5) * 40;
      
      const enemy = this.enemies.create(
        basePos.x + offsetX,
        basePos.y + offsetY,
        'enemy'
      );
      
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0.5);
    }

    window.__signals__.enemiesRemaining = this.enemies.countActive(true);
  }

  shootBullet(pointer) {
    if (!this.player.active) return;

    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);

      // 计算子弹方向
      const angle = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        pointer.x,
        pointer.y
      );

      const bulletSpeed = 400;
      bullet.setVelocity(
        Math.cos(angle) * bulletSpeed,
        Math.sin(angle) * bulletSpeed
      );

      // 子弹超出屏幕后销毁
      this.time.delayedCall(2000, () => {
        if (bullet.active) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      });
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();

    this.totalEnemiesKilled++;
    window.__signals__.totalKilled = this.totalEnemiesKilled;
    window.__signals__.enemiesRemaining = this.enemies.countActive(true);

    console.log(`[HIT] Enemy killed. Remaining: ${this.enemies.countActive(true)}`);
  }

  completeWave() {
    this.isWaveActive = false;
    window.__signals__.isWaveActive = false;
    window.__signals__.waveEndTimes.push(Date.now());

    this.statusText.setText('Status: Wave Complete! Next in 2s...');
    this.statusText.setColor('#00ff00');

    console.log(`[WAVE ${this.currentWave}] Completed. Starting next wave in 2 seconds...`);

    // 2秒后开始下一波
    this.time.delayedCall(this.waveDelay, () => {
      this.startNextWave();
    });
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.enemyCountText.setText(`Enemies: ${this.enemies.countActive(true)}`);
    this.killCountText.setText(`Total Killed: ${this.totalEnemiesKilled}`);
    
    // 更新 signals
    window.__signals__.enemiesRemaining = this.enemies.countActive(true);
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
  scene: WaveSpawnerScene
};

// 启动游戏
const game = new Phaser.Game(config);

// 输出初始状态日志
console.log('[GAME] Wave Spawner System Initialized');
console.log('[CONFIG] Enemies per wave: 15, Speed: 80, Wave delay: 2s');