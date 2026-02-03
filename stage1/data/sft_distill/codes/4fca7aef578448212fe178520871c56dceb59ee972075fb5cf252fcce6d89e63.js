// 波次敌人生成系统
class WaveSpawnerScene extends Phaser.Scene {
  constructor() {
    super('WaveSpawnerScene');
    this.currentWave = 0;
    this.enemiesPerWave = 20;
    this.enemySpeed = 240;
    this.waveDelay = 2000; // 2秒延迟
    this.isWaveActive = false;
    this.enemiesAlive = 0;
    this.totalEnemiesKilled = 0;
    this.waveState = 'waiting'; // waiting, active, completed
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（绿色圆形）
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0x00ff00, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();
  }

  create() {
    // 初始化物理系统
    this.physics.world.setBounds(0, 0, 800, 600);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 玩家与敌人的碰撞检测（可选，这里用点击消灭）
    // this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 点击消灭敌人
    this.input.on('pointerdown', (pointer) => {
      this.checkEnemyClick(pointer);
    });

    // UI文本
    this.waveText = this.add.text(16, 16, '', {
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

    this.statusText = this.add.text(16, 84, '', {
      fontSize: '18px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 初始化信号系统
    window.__signals__ = {
      currentWave: 0,
      enemiesAlive: 0,
      totalKilled: 0,
      waveState: 'waiting',
      events: []
    };

    // 开始第一波
    this.startNextWave();
  }

  startNextWave() {
    this.currentWave++;
    this.isWaveActive = true;
    this.waveState = 'active';
    this.enemiesAlive = this.enemiesPerWave;

    this.logEvent('wave_start', { wave: this.currentWave });

    // 生成敌人
    for (let i = 0; i < this.enemiesPerWave; i++) {
      this.time.delayedCall(i * 100, () => {
        this.spawnEnemy();
      });
    }

    this.updateUI();
    this.updateSignals();
  }

  spawnEnemy() {
    // 随机X位置，从屏幕上方生成
    const x = Phaser.Math.Between(50, 750);
    const y = -30;

    const enemy = this.enemies.create(x, y, 'enemy');
    enemy.setVelocityY(this.enemySpeed);
    enemy.setBounce(0);
    enemy.setCollideWorldBounds(false);

    // 敌人离开屏幕底部时销毁
    enemy.setData('active', true);
  }

  checkEnemyClick(pointer) {
    const enemies = this.enemies.getChildren();
    
    for (let enemy of enemies) {
      if (!enemy.getData('active')) continue;

      const bounds = enemy.getBounds();
      if (bounds.contains(pointer.x, pointer.y)) {
        this.killEnemy(enemy);
        break;
      }
    }
  }

  killEnemy(enemy) {
    if (!enemy.getData('active')) return;

    enemy.setData('active', false);
    enemy.destroy();

    this.enemiesAlive--;
    this.totalEnemiesKilled++;

    this.logEvent('enemy_killed', {
      wave: this.currentWave,
      remaining: this.enemiesAlive,
      totalKilled: this.totalEnemiesKilled
    });

    this.updateUI();
    this.updateSignals();

    // 检查是否完成当前波次
    if (this.enemiesAlive <= 0 && this.isWaveActive) {
      this.completeWave();
    }
  }

  completeWave() {
    this.isWaveActive = false;
    this.waveState = 'completed';

    this.logEvent('wave_complete', {
      wave: this.currentWave,
      totalKilled: this.totalEnemiesKilled
    });

    this.updateUI();
    this.updateSignals();

    // 2秒后开始下一波
    this.waveState = 'waiting';
    this.updateUI();
    this.updateSignals();

    this.time.delayedCall(this.waveDelay, () => {
      this.startNextWave();
    });
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.enemyCountText.setText(`Enemies: ${this.enemiesAlive}/${this.enemiesPerWave}`);

    let statusMsg = '';
    if (this.waveState === 'active') {
      statusMsg = 'Wave Active - Click enemies!';
    } else if (this.waveState === 'completed') {
      statusMsg = 'Wave Complete!';
    } else if (this.waveState === 'waiting') {
      statusMsg = 'Next wave in 2s...';
    }
    this.statusText.setText(statusMsg);
  }

  updateSignals() {
    window.__signals__.currentWave = this.currentWave;
    window.__signals__.enemiesAlive = this.enemiesAlive;
    window.__signals__.totalKilled = this.totalEnemiesKilled;
    window.__signals__.waveState = this.waveState;
  }

  logEvent(type, data) {
    const event = {
      timestamp: Date.now(),
      type: type,
      data: data
    };
    window.__signals__.events.push(event);
    console.log('[EVENT]', JSON.stringify(event));
  }

  update(time, delta) {
    // 清理离开屏幕的敌人
    const enemies = this.enemies.getChildren();
    for (let enemy of enemies) {
      if (enemy.y > 650 && enemy.getData('active')) {
        enemy.setData('active', false);
        enemy.destroy();
        this.enemiesAlive--;
        
        this.updateUI();
        this.updateSignals();

        // 检查波次完成
        if (this.enemiesAlive <= 0 && this.isWaveActive) {
          this.completeWave();
        }
      }
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
  scene: WaveSpawnerScene
};

// 启动游戏
const game = new Phaser.Game(config);

// 导出游戏实例用于测试
window.__game__ = game;