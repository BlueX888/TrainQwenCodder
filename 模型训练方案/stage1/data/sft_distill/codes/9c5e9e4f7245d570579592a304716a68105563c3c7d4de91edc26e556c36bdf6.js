// 全局信号对象用于验证
window.__signals__ = {
  currentWave: 1,
  enemiesRemaining: 10,
  enemiesKilled: 0,
  totalEnemies: 10,
  isWaveActive: true,
  waveTransitionTime: 0
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentWave = 1;
    this.enemiesPerWave = 10;
    this.enemySpeed = 80;
    this.waveDelay = 2000; // 2秒
    this.isWaveActive = false;
    this.enemiesKilled = 0;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（灰色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x808080, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建子弹纹理（黄色小方块）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 8, 12);
    bulletGraphics.generateTexture('bullet', 8, 12);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    // 显示波次文本
    this.waveText = this.add.text(16, 16, 'Wave: 1', {
      fontSize: '32px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    // 显示敌人数量文本
    this.enemyCountText = this.add.text(16, 56, 'Enemies: 0/10', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    // 开始第一波
    this.startWave();

    // 日志输出
    console.log(JSON.stringify({
      event: 'game_start',
      wave: this.currentWave,
      timestamp: Date.now()
    }));
  }

  startWave() {
    this.isWaveActive = true;
    this.enemiesKilled = 0;
    
    // 更新文本
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.enemyCountText.setText(`Enemies: ${this.enemiesPerWave}/${this.enemiesPerWave}`);

    // 生成敌人
    for (let i = 0; i < this.enemiesPerWave; i++) {
      this.time.delayedCall(i * 200, () => {
        this.spawnEnemy();
      });
    }

    // 更新信号
    window.__signals__.currentWave = this.currentWave;
    window.__signals__.enemiesRemaining = this.enemiesPerWave;
    window.__signals__.enemiesKilled = 0;
    window.__signals__.totalEnemies = this.enemiesPerWave;
    window.__signals__.isWaveActive = true;

    // 日志输出
    console.log(JSON.stringify({
      event: 'wave_start',
      wave: this.currentWave,
      enemies: this.enemiesPerWave,
      timestamp: Date.now()
    }));
  }

  spawnEnemy() {
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -30, 'enemy');
    enemy.setVelocityY(this.enemySpeed);
    
    // 敌人离开屏幕底部时移除
    enemy.setData('checkBounds', true);
  }

  hitEnemy(bullet, enemy) {
    bullet.destroy();
    enemy.destroy();
    this.enemiesKilled++;

    const remaining = this.enemiesPerWave - this.enemiesKilled;
    this.enemyCountText.setText(`Enemies: ${remaining}/${this.enemiesPerWave}`);

    // 更新信号
    window.__signals__.enemiesKilled = this.enemiesKilled;
    window.__signals__.enemiesRemaining = remaining;

    // 日志输出
    console.log(JSON.stringify({
      event: 'enemy_killed',
      wave: this.currentWave,
      killed: this.enemiesKilled,
      remaining: remaining,
      timestamp: Date.now()
    }));

    // 检查是否所有敌人被消灭
    if (this.enemiesKilled >= this.enemiesPerWave && this.isWaveActive) {
      this.completeWave();
    }
  }

  completeWave() {
    this.isWaveActive = false;
    window.__signals__.isWaveActive = false;

    // 日志输出
    console.log(JSON.stringify({
      event: 'wave_complete',
      wave: this.currentWave,
      timestamp: Date.now()
    }));

    // 显示波次完成提示
    const completeText = this.add.text(400, 300, `Wave ${this.currentWave} Complete!`, {
      fontSize: '48px',
      fill: '#00ff00',
      fontFamily: 'Arial'
    });
    completeText.setOrigin(0.5);

    // 2秒后进入下一波
    this.time.delayedCall(this.waveDelay, () => {
      completeText.destroy();
      this.currentWave++;
      this.startWave();
    });

    window.__signals__.waveTransitionTime = Date.now();
  }

  shootBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
      
      // 子弹离开屏幕顶部时移除
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

    // 发射子弹（限制射速）
    if (this.spaceKey.isDown && time > this.lastFired + 200) {
      this.shootBullet();
      this.lastFired = time;
    }

    // 清理离开屏幕的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.y > 620) {
        enemy.destroy();
        // 注意：离开屏幕的敌人不计入击杀数，但需要检查是否所有敌人都消失
        const activeEnemies = this.enemies.countActive(true);
        if (activeEnemies === 0 && this.isWaveActive && this.enemiesKilled < this.enemiesPerWave) {
          // 如果所有敌人都离开屏幕但没被全部击杀，仍然进入下一波
          this.completeWave();
        }
      }
    });

    // 清理离开屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -20) {
        bullet.destroy();
      }
    });
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
  scene: GameScene
};

const game = new Phaser.Game(config);

// 输出初始信号
console.log(JSON.stringify({
  event: 'game_init',
  config: {
    width: config.width,
    height: config.height,
    enemiesPerWave: 10,
    enemySpeed: 80,
    waveDelay: 2000
  },
  timestamp: Date.now()
}));