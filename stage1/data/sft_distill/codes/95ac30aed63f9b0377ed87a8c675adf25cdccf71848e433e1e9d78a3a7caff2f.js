class WaveSpawnerScene extends Phaser.Scene {
  constructor() {
    super('WaveSpawnerScene');
    this.currentWave = 1;
    this.enemiesPerWave = 8;
    this.enemySpeed = 120;
    this.waveDelay = 2000; // 2秒
    this.isWaveActive = false;
    this.enemiesRemaining = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（白色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xffffff, 1);
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
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 碰撞检测：玩家与敌人
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.playerHitEnemy,
      null,
      this
    );

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;

    // UI文本
    this.waveText = this.add.text(16, 16, 'Wave: 1', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.enemyCountText = this.add.text(16, 50, 'Enemies: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(16, 80, '', {
      fontSize: '18px',
      fill: '#00ff00'
    });

    // 开始第一波
    this.startWave();
  }

  startWave() {
    this.isWaveActive = true;
    this.enemiesRemaining = this.enemiesPerWave;
    this.statusText.setText('Wave Starting!');

    // 生成8个敌人
    for (let i = 0; i < this.enemiesPerWave; i++) {
      const x = 100 + (i * 80);
      const y = 100;
      const enemy = this.enemies.create(x, y, 'enemy');
      
      // 设置敌人速度（向下移动）
      enemy.setVelocity(
        Phaser.Math.Between(-50, 50),
        this.enemySpeed
      );
      
      // 设置边界反弹
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }

    this.updateUI();
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.destroy();
    enemy.destroy();
    
    this.enemiesRemaining--;
    this.updateUI();

    // 检查是否所有敌人都被消灭
    if (this.enemiesRemaining <= 0 && this.isWaveActive) {
      this.isWaveActive = false;
      this.statusText.setText('Wave Complete! Next wave in 2s...');
      
      // 2秒后开始下一波
      this.time.addEvent({
        delay: this.waveDelay,
        callback: () => {
          this.currentWave++;
          this.startWave();
        },
        callbackScope: this
      });
    }
  }

  playerHitEnemy(player, enemy) {
    // 简单处理：敌人反弹
    enemy.setVelocity(
      Phaser.Math.Between(-100, 100),
      -this.enemySpeed
    );
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.enemyCountText.setText(`Enemies: ${this.enemiesRemaining}`);
  }

  fireBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
      
      // 子弹超出屏幕后销毁
      this.time.addEvent({
        delay: 2000,
        callback: () => {
          if (bullet.active) {
            bullet.destroy();
          }
        }
      });
    }
  }

  update(time, delta) {
    // 玩家移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 发射子弹（限制射速）
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

    // 敌人超出屏幕底部时重新定位到顶部
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.y > 610) {
        enemy.y = -10;
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
  scene: WaveSpawnerScene
};

const game = new Phaser.Game(config);