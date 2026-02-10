class WaveSpawnerScene extends Phaser.Scene {
  constructor() {
    super('WaveSpawnerScene');
    // 可验证的状态变量
    this.wave = 1;
    this.enemiesAlive = 0;
    this.totalEnemiesKilled = 0;
    this.isWaveActive = false;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(-20, -20, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（灰色）
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0x808080, 1);
    enemyGraphics.fillRect(-15, -15, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(-2, -5, 4, 10);
    bulletGraphics.generateTexture('bullet', 4, 10);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 30
    });

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;

    // 碰撞检测：子弹击中敌人
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    // 碰撞检测：敌人碰到玩家（游戏结束）
    this.physics.add.overlap(this.player, this.enemies, this.gameOver, null, this);

    // UI文本
    this.waveText = this.add.text(16, 16, `Wave: ${this.wave}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.enemiesText = this.add.text(16, 48, `Enemies: ${this.enemiesAlive}`, {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.statusText = this.add.text(16, 80, '', {
      fontSize: '20px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });

    this.killCountText = this.add.text(16, 112, `Total Killed: ${this.totalEnemiesKilled}`, {
      fontSize: '18px',
      fill: '#00ff00',
      fontFamily: 'Arial'
    });

    // 开始第一波
    this.spawnWave();
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
    if (this.spaceKey.isDown && time > this.lastFired + 200) {
      this.shoot();
      this.lastFired = time;
    }

    // 清理出界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 清理出界的敌人（到达底部）
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && enemy.y > 610) {
        enemy.destroy();
        this.enemiesAlive--;
        this.updateUI();
        this.checkWaveComplete();
      }
    });

    // 更新UI
    this.updateUI();
  }

  shoot() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 30);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
    }
  }

  spawnWave() {
    this.isWaveActive = true;
    this.statusText.setText('');
    
    // 每波生成8个敌人
    const enemiesPerWave = 8;
    const spacing = 80;
    const startX = 400 - (enemiesPerWave - 1) * spacing / 2;

    for (let i = 0; i < enemiesPerWave; i++) {
      const enemy = this.enemies.create(
        startX + i * spacing,
        50,
        'enemy'
      );
      
      // 设置敌人速度为200（向下）
      enemy.setVelocityY(200);
      this.enemiesAlive++;
    }

    this.updateUI();
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();
    
    this.enemiesAlive--;
    this.totalEnemiesKilled++;
    
    this.updateUI();
    this.checkWaveComplete();
  }

  checkWaveComplete() {
    // 检查当前波是否完成
    if (this.isWaveActive && this.enemiesAlive === 0) {
      this.isWaveActive = false;
      this.statusText.setText('Wave Complete! Next wave in 2s...');
      
      // 2秒后开始下一波
      this.time.delayedCall(2000, () => {
        this.wave++;
        this.spawnWave();
      }, [], this);
    }
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.wave}`);
    this.enemiesText.setText(`Enemies: ${this.enemiesAlive}`);
    this.killCountText.setText(`Total Killed: ${this.totalEnemiesKilled}`);
  }

  gameOver(player, enemy) {
    this.physics.pause();
    this.statusText.setText('GAME OVER!');
    this.statusText.setStyle({ fill: '#ff0000', fontSize: '32px' });
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

// 创建游戏实例
const game = new Phaser.Game(config);

// 暴露状态用于验证
game.getState = function() {
  const scene = game.scene.scenes[0];
  return {
    wave: scene.wave,
    enemiesAlive: scene.enemiesAlive,
    totalEnemiesKilled: scene.totalEnemiesKilled,
    isWaveActive: scene.isWaveActive
  };
};