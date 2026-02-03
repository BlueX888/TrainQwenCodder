class WaveSpawnerScene extends Phaser.Scene {
  constructor() {
    super('WaveSpawnerScene');
    this.currentWave = 1;
    this.enemiesPerWave = 12;
    this.enemySpeed = 240;
    this.waveDelay = 2000; // 2秒
    this.isWaveActive = false;
    this.enemiesRemaining = 0;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillTriangle(0, -20, -15, 20, 15, 20);
    playerGraphics.generateTexture('player', 30, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（粉色）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff69b4, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 4, 10);
    bulletGraphics.generateTexture('bullet', 4, 10);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;

    // 碰撞检测：子弹击中敌人
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    // UI文本
    this.waveText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.statusText = this.add.text(16, 80, '', {
      fontSize: '18px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });

    // 开始第一波
    this.startWave();
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

    // 发射子弹（每200ms一次）
    if (this.spaceKey.isDown && time > this.lastFired + 200) {
      this.fireBullet();
      this.lastFired = time;
    }

    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.y < -10) {
        bullet.destroy();
      }
    });

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.y > 610) {
        enemy.destroy();
        this.enemiesRemaining--;
        this.checkWaveComplete();
      }
    });

    // 更新UI
    this.updateUI();
  }

  startWave() {
    this.isWaveActive = true;
    this.enemiesRemaining = this.enemiesPerWave;
    this.statusText.setText('Wave Starting!');

    // 使用固定种子确保可重现性
    const seed = this.currentWave * 1000;
    
    // 生成12个敌人
    for (let i = 0; i < this.enemiesPerWave; i++) {
      this.time.delayedCall(i * 300, () => {
        this.spawnEnemy(seed + i);
      });
    }

    // 延迟后清除状态文本
    this.time.delayedCall(2000, () => {
      this.statusText.setText('');
    });
  }

  spawnEnemy(seed) {
    // 使用种子生成确定性随机位置
    const x = 50 + (seed % 700);
    const enemy = this.enemies.create(x, -30, 'enemy');
    
    enemy.setVelocityY(this.enemySpeed);
    enemy.setCollideWorldBounds(false);
  }

  fireBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.destroy();
    enemy.destroy();
    
    this.enemiesRemaining--;
    
    // 检查波次是否完成
    this.checkWaveComplete();
  }

  checkWaveComplete() {
    if (this.enemiesRemaining <= 0 && this.isWaveActive) {
      this.isWaveActive = false;
      this.statusText.setText('Wave Complete! Next wave in 2s...');
      
      // 2秒后开始下一波
      this.time.delayedCall(this.waveDelay, () => {
        this.currentWave++;
        this.startWave();
      });
    }
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.enemyCountText.setText(`Enemies: ${Math.max(0, this.enemiesRemaining)}`);
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
  scene: WaveSpawnerScene
};

const game = new Phaser.Game(config);

// 可验证的状态信号
console.log('Game initialized with wave spawner system');
console.log('Controls: Arrow keys to move, SPACE to shoot');
console.log('Wave system: 12 enemies per wave, 2 second delay between waves');