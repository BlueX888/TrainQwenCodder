const SEED = 12345; // 固定种子，修改此值可生成不同布局

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacles = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置确定性随机种子
    this.rnd = new Phaser.Math.RandomDataGenerator([SEED]);
    
    // 显示当前 seed
    const seedText = this.add.text(10, 10, `Seed: ${SEED}`, {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    seedText.setDepth(100);

    // 显示标题
    const titleText = this.add.text(400, 30, 'Deterministic Obstacle Layout', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    titleText.setOrigin(0.5, 0);

    // 生成 12 个粉色障碍物
    const obstacleData = [];
    const padding = 50; // 边界留白
    const minSize = 40;
    const maxSize = 80;

    for (let i = 0; i < 12; i++) {
      // 使用确定性随机生成位置和大小
      const x = this.rnd.between(padding, 800 - padding);
      const y = this.rnd.between(100, 600 - padding);
      const width = this.rnd.between(minSize, maxSize);
      const height = this.rnd.between(minSize, maxSize);
      const rotation = this.rnd.between(0, 360);

      // 创建障碍物图形
      const obstacle = this.add.graphics();
      obstacle.fillStyle(0xff69b4, 1); // 粉色
      obstacle.fillRect(-width / 2, -height / 2, width, height);
      
      // 添加边框
      obstacle.lineStyle(2, 0xff1493, 1); // 深粉色边框
      obstacle.strokeRect(-width / 2, -height / 2, width, height);
      
      obstacle.setPosition(x, y);
      obstacle.setRotation(Phaser.Math.DegToRad(rotation));

      // 添加障碍物编号
      const label = this.add.text(x, y, `${i + 1}`, {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      label.setOrigin(0.5);
      label.setDepth(1);

      this.obstacles.push({
        id: i + 1,
        x: Math.round(x),
        y: Math.round(y),
        width: width,
        height: height,
        rotation: rotation
      });

      obstacleData.push({
        id: i + 1,
        x: Math.round(x),
        y: Math.round(y),
        width: width,
        height: height,
        rotation: rotation
      });
    }

    // 添加说明文本
    const infoText = this.add.text(400, 560, 
      'Each obstacle is deterministically placed based on the seed.\nChanging the seed will generate a different layout.', 
      {
        fontSize: '16px',
        color: '#cccccc',
        align: 'center'
      }
    );
    infoText.setOrigin(0.5);

    // 输出验证信号
    window.__signals__ = {
      seed: SEED,
      obstacleCount: 12,
      obstacles: obstacleData,
      timestamp: Date.now(),
      checksum: this.calculateChecksum(obstacleData)
    };

    // 输出到控制台用于验证
    console.log('Deterministic Layout Generated:');
    console.log(JSON.stringify(window.__signals__, null, 2));

    // 验证确定性：重新生成一次并比较
    this.verifyDeterminism();
  }

  calculateChecksum(data) {
    // 简单的校验和计算，用于验证确定性
    let sum = 0;
    data.forEach(obstacle => {
      sum += obstacle.x + obstacle.y + obstacle.width + obstacle.height;
    });
    return sum;
  }

  verifyDeterminism() {
    // 使用相同 seed 重新生成数据，验证确定性
    const testRnd = new Phaser.Math.RandomDataGenerator([SEED]);
    const padding = 50;
    const minSize = 40;
    const maxSize = 80;
    
    let isConsistent = true;
    for (let i = 0; i < 12; i++) {
      const x = testRnd.between(padding, 800 - padding);
      const y = testRnd.between(100, 600 - padding);
      const width = testRnd.between(minSize, maxSize);
      const height = testRnd.between(minSize, maxSize);
      const rotation = testRnd.between(0, 360);

      const original = this.obstacles[i];
      if (original.x !== Math.round(x) || 
          original.y !== Math.round(y) || 
          original.width !== width || 
          original.height !== height ||
          original.rotation !== rotation) {
        isConsistent = false;
        break;
      }
    }

    window.__signals__.determinismVerified = isConsistent;
    console.log(`Determinism Verification: ${isConsistent ? 'PASSED' : 'FAILED'}`);
  }

  update(time, delta) {
    // 可选：添加轻微的视觉效果（不影响布局确定性）
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  seed: [SEED] // 设置全局随机种子
};

const game = new Phaser.Game(config);