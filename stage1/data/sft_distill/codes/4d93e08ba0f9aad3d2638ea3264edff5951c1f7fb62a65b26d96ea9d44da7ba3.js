class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentWave = 1;
    this.enemiesInWave = 3;
    this.enemySpeed = 80;
    this.waveDelay = 2000;
    this.isWaveActive = false;
    this.enemiesAlive = 0;
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（橙色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff8800, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建子弹纹理（黄色小方块）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 8, 16);
    bulletGraphics.generateTexture('bullet', 8, 16);
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
      maxSize: 20
    });

    // 碰撞检测：子弹击中敌人
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 碰撞检测：敌人击中玩家
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitPlayer,
      null,
      this
    );

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;

    // 显示波次信息
    this.waveText = this.add.text(16, 16, 'Wave: 1', {
      fontSize: '32px',
      fill: '#ffffff'
    });

    // 显示敌人计数
    this.enemyCountText = this.add.text(16, 56, 'Enemies: 0/3', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 显示状态信息
    this.statusText = this.add.text(16, 96, '', {
      fontSize: '20px',
      fill: '#ffff00'
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

    // 发射子弹
    if (this.spaceKey.isDown && time > this.lastFired + 200) {
      this.fireBullet();
      this.lastFired = time;
    }

    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -20) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && enemy.y > 620) {
        this.destroyEnemy(enemy);
      }
    });

    // 更新敌人计数显示
    this.updateEnemyCount();
  }

  startWave() {
    this.isWaveActive = true;
    this.enemiesAlive = this.enemiesInWave;
    this.statusText.setText(`Starting Wave ${this.currentWave}...`);

    // 生成敌人
    for (let i = 0; i < this.enemiesInWave; i++) {
      this.time.delayedCall(i * 500, () => {
        this.spawnEnemy();
      });
    }

    // 更新波次显示
    this.waveText.setText(`Wave: ${this.currentWave}`);
  }

  spawnEnemy() {
    // 随机 X 位置（避免边缘）
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -40, 'enemy');
    
    if (enemy) {
      enemy.setVelocityY(this.enemySpeed);
      enemy.setCollideWorldBounds(false);
    }
  }

  fireBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 30);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);

    // 销毁敌人
    this.destroyEnemy(enemy);
  }

  destroyEnemy(enemy) {
    if (!enemy.active) return;

    enemy.destroy();
    this.enemiesAlive--;

    // 检查是否清空当前波次
    if (this.enemiesAlive <= 0 && this.isWaveActive) {
      this.completeWave();
    }
  }

  completeWave() {
    this.isWaveActive = false;
    this.statusText.setText(`Wave ${this.currentWave} Complete! Next wave in 2s...`);

    // 2秒后开始下一波
    this.time.delayedCall(this.waveDelay, () => {
      this.currentWave++;
      this.startWave();
    });
  }

  hitPlayer(player, enemy) {
    // 简单处理：销毁敌人（可扩展为扣血逻辑）
    this.destroyEnemy(enemy);
    
    // 可以添加玩家受伤效果
    player.setTint(0xff0000);
    this.time.delayedCall(100, () => {
      player.clearTint();
    });
  }

  updateEnemyCount() {
    const activeEnemies = this.enemies.countActive(true);
    this.enemyCountText.setText(`Enemies: ${activeEnemies}/${this.enemiesInWave}`);
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

new Phaser.Game(config);