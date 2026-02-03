class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 可验证的状态变量
    this.wave = 1;
    this.enemiesAlive = 0;
    this.totalEnemiesKilled = 0;
    this.isWaveTransition = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（粉色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff69b4, 1);
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

    // 碰撞检测：玩家撞到敌人（可选，这里只做销毁敌人处理）
    this.physics.add.overlap(this.player, this.enemies, this.playerHitEnemy, null, this);

    // UI文本
    this.waveText = this.add.text(16, 16, `Wave: ${this.wave}`, {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.enemyCountText = this.add.text(16, 50, `Enemies: ${this.enemiesAlive}`, {
      fontSize: '20px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.killCountText = this.add.text(16, 80, `Killed: ${this.totalEnemiesKilled}`, {
      fontSize: '20px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    // 生成第一波敌人
    this.spawnWave();
  }

  update(time, delta) {
    if (this.isWaveTransition) {
      return; // 波次过渡期间不处理输入
    }

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
      this.shootBullet();
      this.lastFired = time;
    }

    // 更新敌人计数
    this.enemiesAlive = this.enemies.countActive(true);
    this.enemyCountText.setText(`Enemies: ${this.enemiesAlive}`);

    // 检查是否所有敌人被消灭
    if (this.enemiesAlive === 0 && !this.isWaveTransition) {
      this.startNextWave();
    }

    // 移除超出屏幕的子弹和敌人
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -20) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && enemy.y > 620) {
        enemy.destroy();
      }
    });
  }

  shootBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.velocity.y = -400;
    }
  }

  spawnWave() {
    this.isWaveTransition = false;
    const enemiesPerWave = 20;
    
    // 使用固定种子生成确定性随机位置
    const seed = this.wave * 1000;
    
    for (let i = 0; i < enemiesPerWave; i++) {
      // 使用简单的伪随机算法保证确定性
      const pseudoRandom = (seed + i * 137) % 760 + 20;
      const x = pseudoRandom;
      const y = -50 - (i * 30); // 错开生成时间
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(0, 120); // 敌人速度固定为120
      
      // 添加轻微的水平移动使其更有趣
      const horizontalSpeed = ((seed + i * 73) % 100 - 50);
      enemy.setVelocityX(horizontalSpeed);
      enemy.setBounce(1, 0);
      enemy.setCollideWorldBounds(true);
    }

    this.waveText.setText(`Wave: ${this.wave}`);
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();
    
    this.totalEnemiesKilled++;
    this.killCountText.setText(`Killed: ${this.totalEnemiesKilled}`);
  }

  playerHitEnemy(player, enemy) {
    // 玩家撞到敌人，销毁敌人（可扩展为扣血逻辑）
    enemy.destroy();
  }

  startNextWave() {
    this.isWaveTransition = true;
    
    // 显示过渡提示
    const transitionText = this.add.text(400, 300, 'Next Wave in 2s...', {
      fontSize: '32px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });
    transitionText.setOrigin(0.5);

    // 2秒后开始下一波
    this.time.addEvent({
      delay: 2000,
      callback: () => {
        this.wave++;
        transitionText.destroy();
        this.spawnWave();
      },
      callbackScope: this
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

// 暴露状态变量供外部验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    wave: scene.wave,
    enemiesAlive: scene.enemiesAlive,
    totalEnemiesKilled: scene.totalEnemiesKilled,
    isWaveTransition: scene.isWaveTransition
  };
};