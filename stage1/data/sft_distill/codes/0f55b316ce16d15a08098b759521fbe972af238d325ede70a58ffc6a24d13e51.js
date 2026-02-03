// 无尽模式波次游戏
class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    this.wave = 0;
    this.kills = 0;
    this.remainingEnemies = 0;
    this.baseEnemySpeed = 80;
    this.baseEnemyCount = 10;
    this.isSpawning = false;
    this.randomSeed = 12345; // 固定随机种子
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 8, 8);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  create() {
    // 初始化随机数生成器
    Phaser.Math.RND.sow([this.randomSeed]);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group({
      defaultKey: 'enemy',
      maxSize: 100
    });

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;
    this.fireRate = 200; // 射击间隔

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.playerHit, null, this);

    // UI文本
    this.waveText = this.add.text(16, 16, 'Wave: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.killsText = this.add.text(16, 48, 'Kills: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.remainingText = this.add.text(16, 80, 'Remaining: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 开始第一波
    this.startNextWave();
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

    // 射击
    if (this.spaceKey.isDown && time > this.lastFired) {
      this.fire();
      this.lastFired = time + this.fireRate;
    }

    // 敌人追踪玩家
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active) {
        this.physics.moveToObject(enemy, this.player, enemy.getData('speed'));
      }
    });

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && (bullet.y < 0 || bullet.y > 600 || bullet.x < 0 || bullet.x > 800)) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 检查是否需要开始下一波
    if (!this.isSpawning && this.remainingEnemies === 0 && this.wave > 0) {
      this.time.delayedCall(2000, () => {
        this.startNextWave();
      });
      this.isSpawning = true; // 防止重复触发
    }
  }

  fire() {
    const bullet = this.bullets.get(this.player.x, this.player.y);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.velocity.y = -400;
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.velocity.set(0);

    enemy.setActive(false);
    enemy.setVisible(false);
    enemy.body.velocity.set(0);

    // 更新统计
    this.kills++;
    this.remainingEnemies--;
    this.updateUI();
  }

  playerHit(player, enemy) {
    // 敌人碰到玩家后消失
    enemy.setActive(false);
    enemy.setVisible(false);
    enemy.body.velocity.set(0);

    this.remainingEnemies--;
    this.updateUI();

    // 可以在这里添加玩家受伤逻辑
  }

  startNextWave() {
    this.wave++;
    const enemyCount = this.baseEnemyCount + (this.wave - 1);
    const enemySpeed = this.baseEnemySpeed + (this.wave - 1) * 10;

    this.remainingEnemies = enemyCount;
    this.isSpawning = false;

    // 显示波次开始提示
    this.statusText.setText(`Wave ${this.wave} Start!`);
    this.time.delayedCall(1500, () => {
      this.statusText.setText('');
    });

    // 生成敌人
    for (let i = 0; i < enemyCount; i++) {
      this.time.delayedCall(i * 500, () => {
        this.spawnEnemy(enemySpeed);
      });
    }

    this.updateUI();
  }

  spawnEnemy(speed) {
    // 随机从屏幕上方或侧边生成
    const side = Phaser.Math.RND.between(0, 3);
    let x, y;

    switch (side) {
      case 0: // 上边
        x = Phaser.Math.RND.between(0, 800);
        y = -32;
        break;
      case 1: // 右边
        x = 832;
        y = Phaser.Math.RND.between(0, 600);
        break;
      case 2: // 下边
        x = Phaser.Math.RND.between(0, 800);
        y = 632;
        break;
      case 3: // 左边
        x = -32;
        y = Phaser.Math.RND.between(0, 600);
        break;
    }

    const enemy = this.enemies.get(x, y);
    if (enemy) {
      enemy.setActive(true);
      enemy.setVisible(true);
      enemy.setData('speed', speed);
    }
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.wave}`);
    this.killsText.setText(`Kills: ${this.kills}`);
    this.remainingText.setText(`Remaining: ${this.remainingEnemies}`);
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
  scene: EndlessWaveScene
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态用于验证
game.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    wave: scene.wave,
    kills: scene.kills,
    remainingEnemies: scene.remainingEnemies,
    enemySpeed: scene.baseEnemySpeed + (scene.wave - 1) * 10,
    enemyCount: scene.baseEnemyCount + (scene.wave - 1)
  };
};