// 波次敌人生成系统
class WaveSpawnerScene extends Phaser.Scene {
  constructor() {
    super('WaveSpawnerScene');
    this.currentWave = 0;
    this.enemiesPerWave = 20;
    this.enemySpeed = 240;
    this.waveDelay = 2000; // 2秒
    this.isWaveActive = false;
    this.totalEnemiesKilled = 0;
  }

  preload() {
    // 创建纯色纹理
    this.createTextures();
  }

  createTextures() {
    // 玩家纹理 - 蓝色方块
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 敌人纹理 - 绿色圆形
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ff00, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 子弹纹理 - 黄色小圆
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  create() {
    // 初始化signals
    window.__signals__ = {
      currentWave: 0,
      enemiesAlive: 0,
      enemiesKilled: 0,
      isWaveActive: false,
      waveStartTimes: [],
      waveEndTimes: [],
      events: []
    };

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group({
      defaultKey: 'enemy',
      maxSize: 30
    });

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });

    // 碰撞检测
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;

    // UI文本
    this.waveText = this.add.text(16, 16, 'Wave: 0', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.enemyCountText = this.add.text(16, 48, 'Enemies: 0/0', {
      fontSize: '20px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.statusText = this.add.text(16, 80, 'Status: Ready', {
      fontSize: '20px',
      fill: '#0f0',
      fontFamily: 'Arial'
    });

    this.killCountText = this.add.text(16, 112, 'Total Kills: 0', {
      fontSize: '20px',
      fill: '#ff0',
      fontFamily: 'Arial'
    });

    // 开始第一波
    this.startNextWave();
  }

  startNextWave() {
    this.currentWave++;
    this.isWaveActive = true;

    const startTime = this.time.now;
    window.__signals__.currentWave = this.currentWave;
    window.__signals__.isWaveActive = true;
    window.__signals__.waveStartTimes.push(startTime);
    window.__signals__.events.push({
      type: 'WAVE_START',
      wave: this.currentWave,
      time: startTime
    });

    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.statusText.setText('Status: Fighting');
    this.statusText.setColor('#f00');

    // 生成敌人
    this.spawnEnemies();
    this.updateEnemyCount();
  }

  spawnEnemies() {
    const spawnPositions = [
      { x: 100, y: 50 },
      { x: 300, y: 50 },
      { x: 500, y: 50 },
      { x: 700, y: 50 }
    ];

    for (let i = 0; i < this.enemiesPerWave; i++) {
      // 使用固定模式生成位置（确定性）
      const posIndex = i % spawnPositions.length;
      const basePos = spawnPositions[posIndex];
      const offsetX = (i % 5) * 40;
      const offsetY = Math.floor(i / 5) * 40;

      const enemy = this.enemies.get(
        basePos.x + offsetX,
        basePos.y + offsetY,
        'enemy'
      );

      if (enemy) {
        enemy.setActive(true);
        enemy.setVisible(true);
        enemy.body.setVelocity(
          Phaser.Math.Between(-this.enemySpeed, this.enemySpeed) * 0.5,
          this.enemySpeed * 0.3
        );
        enemy.body.setBounce(1, 1);
        enemy.body.setCollideWorldBounds(true);
      }
    }

    window.__signals__.enemiesAlive = this.enemies.countActive(true);
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.setActive(false);
    enemy.setVisible(false);

    this.totalEnemiesKilled++;
    window.__signals__.enemiesKilled = this.totalEnemiesKilled;
    window.__signals__.enemiesAlive = this.enemies.countActive(true);
    window.__signals__.events.push({
      type: 'ENEMY_KILLED',
      wave: this.currentWave,
      totalKills: this.totalEnemiesKilled,
      time: this.time.now
    });

    this.updateEnemyCount();

    // 检查是否消灭所有敌人
    if (this.enemies.countActive(true) === 0 && this.isWaveActive) {
      this.onWaveComplete();
    }
  }

  onWaveComplete() {
    this.isWaveActive = false;
    const endTime = this.time.now;

    window.__signals__.isWaveActive = false;
    window.__signals__.waveEndTimes.push(endTime);
    window.__signals__.events.push({
      type: 'WAVE_COMPLETE',
      wave: this.currentWave,
      time: endTime
    });

    this.statusText.setText('Status: Wave Clear!');
    this.statusText.setColor('#0f0');

    // 2秒后开始下一波
    this.time.addEvent({
      delay: this.waveDelay,
      callback: () => {
        window.__signals__.events.push({
          type: 'WAVE_DELAY_END',
          nextWave: this.currentWave + 1,
          time: this.time.now
        });
        this.startNextWave();
      },
      callbackScope: this
    });
  }

  updateEnemyCount() {
    const alive = this.enemies.countActive(true);
    this.enemyCountText.setText(`Enemies: ${alive}/${this.enemiesPerWave}`);
    this.killCountText.setText(`Total Kills: ${this.totalEnemiesKilled}`);
  }

  shootBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20, 'bullet');
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.setVelocity(0, -400);

      // 子弹出界自动销毁
      this.time.addEvent({
        delay: 2000,
        callback: () => {
          if (bullet.active) {
            bullet.setActive(false);
            bullet.setVisible(false);
          }
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

    // 射击（每200ms一次）
    if (this.spaceKey.isDown && time > this.lastFired + 200) {
      this.shootBullet();
      this.lastFired = time;
    }

    // 清理出界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
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
  scene: WaveSpawnerScene
};

// 启动游戏
const game = new Phaser.Game(config);

// 输出验证信息
console.log('=== Wave Spawner Game Started ===');
console.log('Controls: Arrow Keys to move, SPACE to shoot');
console.log('Objective: Defeat 20 enemies per wave');
console.log('Signals available at: window.__signals__');