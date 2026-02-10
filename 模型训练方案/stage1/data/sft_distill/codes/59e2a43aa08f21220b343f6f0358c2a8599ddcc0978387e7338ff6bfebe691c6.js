class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentWave = 1;
    this.enemiesPerWave = 10;
    this.enemySpeed = 360;
    this.waveDelay = 2000; // 2秒
    this.isWaveActive = false;
    this.remainingEnemies = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（灰色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x808080, 1);
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
      maxSize: 30
    });

    // 碰撞检测：子弹击中敌人
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    // 碰撞检测：敌人碰到玩家（游戏结束逻辑可选）
    this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;
    this.fireRate = 200; // 射击间隔

    // UI文本
    this.waveText = this.add.text(16, 16, `Wave: ${this.currentWave}`, {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.enemyCountText = this.add.text(16, 48, `Enemies: ${this.remainingEnemies}`, {
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
    const speed = 300;
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

    // 射击
    if (this.spaceKey.isDown && time > this.lastFired) {
      this.fireBullet();
      this.lastFired = time + this.fireRate;
    }

    // 更新敌人朝向玩家移动
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active) {
        this.physics.moveToObject(enemy, this.player, this.enemySpeed);
      }
    });

    // 检查波次完成
    if (this.isWaveActive && this.remainingEnemies === 0) {
      this.completeWave();
    }
  }

  startWave() {
    this.isWaveActive = true;
    this.remainingEnemies = this.enemiesPerWave;
    this.statusText.setText('');

    // 生成敌人
    for (let i = 0; i < this.enemiesPerWave; i++) {
      this.spawnEnemy();
    }

    this.updateUI();
  }

  spawnEnemy() {
    // 随机生成位置（屏幕边缘）
    let x, y;
    const side = Phaser.Math.Between(0, 3);
    
    switch(side) {
      case 0: // 上方
        x = Phaser.Math.Between(0, 800);
        y = -20;
        break;
      case 1: // 右方
        x = 820;
        y = Phaser.Math.Between(0, 600);
        break;
      case 2: // 下方
        x = Phaser.Math.Between(0, 800);
        y = 620;
        break;
      case 3: // 左方
        x = -20;
        y = Phaser.Math.Between(0, 600);
        break;
    }

    const enemy = this.enemies.create(x, y, 'enemy');
    enemy.setCollideWorldBounds(false); // 允许离开边界后销毁
  }

  fireBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
      
      // 子弹离开屏幕后销毁
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

    this.remainingEnemies--;
    this.updateUI();
  }

  hitPlayer(player, enemy) {
    // 可选：玩家被击中逻辑
    enemy.destroy();
    this.remainingEnemies--;
    this.updateUI();
  }

  completeWave() {
    this.isWaveActive = false;
    this.statusText.setText('Wave Complete! Next wave in 2s...');

    // 2秒后开始下一波
    this.time.delayedCall(this.waveDelay, () => {
      this.currentWave++;
      this.startWave();
    });
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.enemyCountText.setText(`Enemies: ${this.remainingEnemies}`);
  }
}

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
  scene: GameScene
};

new Phaser.Game(config);